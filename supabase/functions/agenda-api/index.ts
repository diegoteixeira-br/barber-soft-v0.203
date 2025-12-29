import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify API Key
    const apiKey = req.headers.get('x-api-key');
    const expectedApiKey = Deno.env.get('BARBERSOFT_API_KEY');
    
    if (!apiKey || apiKey !== expectedApiKey) {
      console.error('Invalid or missing API key');
      return new Response(
        JSON.stringify({ success: false, error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { action, instance_name } = body;

    console.log('Agenda API called with action:', action);
    console.log('Request body:', JSON.stringify(body));

    // Se instance_name for fornecido, buscar a unidade diretamente por ele
    let resolvedUnitId = body.unit_id;
    let companyId = null;
    
    if (instance_name && !resolvedUnitId) {
      console.log(`Looking up unit by instance_name: ${instance_name}`);
      
      // Busca direto na tabela units pelo evolution_instance_name
      const { data: unit, error: unitError } = await supabase
        .from('units')
        .select('id, company_id')
        .eq('evolution_instance_name', instance_name)
        .maybeSingle();
      
      if (unitError) {
        console.error('Error looking up unit:', unitError);
        return new Response(
          JSON.stringify({ success: false, error: 'Erro ao buscar unidade' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (!unit) {
        console.error(`Unit not found for instance: ${instance_name}`);
        return new Response(
          JSON.stringify({ success: false, error: `Unidade não encontrada para a instância "${instance_name}"` }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      resolvedUnitId = unit.id;
      companyId = unit.company_id;
      console.log(`Resolved unit_id: ${resolvedUnitId}, company_id: ${companyId}`);
    }

    // Passar o unit_id resolvido para os handlers
    const enrichedBody = { ...body, unit_id: resolvedUnitId, company_id: companyId };

    switch (action) {
      case 'check':
        return await handleCheck(supabase, enrichedBody, corsHeaders);
      case 'create':
        return await handleCreate(supabase, enrichedBody, corsHeaders);
      case 'cancel':
        return await handleCancel(supabase, enrichedBody, corsHeaders);
      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Ação inválida' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: unknown) {
    console.error('Error in agenda-api:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Handler para consultar disponibilidade
async function handleCheck(supabase: any, body: any, corsHeaders: any) {
  const { date, professional, unit_id } = body;

  if (!date) {
    return new Response(
      JSON.stringify({ success: false, error: 'Data é obrigatória' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!unit_id) {
    return new Response(
      JSON.stringify({ success: false, error: 'unit_id é obrigatório' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log(`Checking availability for date: ${date}, professional: ${professional || 'any'}, unit: ${unit_id}`);

  // Buscar barbeiros ativos da unidade
  let barbersQuery = supabase
    .from('barbers')
    .select('id, name, calendar_color')
    .eq('unit_id', unit_id)
    .eq('is_active', true);

  if (professional && professional.trim() !== '') {
    barbersQuery = barbersQuery.ilike('name', `%${professional}%`);
  }

  const { data: barbers, error: barbersError } = await barbersQuery;

  if (barbersError) {
    console.error('Error fetching barbers:', barbersError);
    return new Response(
      JSON.stringify({ success: false, error: 'Erro ao buscar barbeiros' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!barbers || barbers.length === 0) {
    return new Response(
      JSON.stringify({ 
        success: true, 
        date,
        available_slots: [],
        message: professional ? `Nenhum barbeiro encontrado com o nome "${professional}"` : 'Nenhum barbeiro ativo encontrado'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log(`Found ${barbers.length} barbers`);

  // Buscar serviços ativos da unidade
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('id, name, price, duration_minutes')
    .eq('unit_id', unit_id)
    .eq('is_active', true);

  if (servicesError) {
    console.error('Error fetching services:', servicesError);
  }

  // Buscar agendamentos do dia (exceto cancelados)
  const startOfDay = `${date}T00:00:00`;
  const endOfDay = `${date}T23:59:59`;

  const { data: appointments, error: appointmentsError } = await supabase
    .from('appointments')
    .select('id, barber_id, start_time, end_time, status')
    .eq('unit_id', unit_id)
    .gte('start_time', startOfDay)
    .lte('start_time', endOfDay)
    .neq('status', 'cancelled');

  if (appointmentsError) {
    console.error('Error fetching appointments:', appointmentsError);
  }

  console.log(`Found ${appointments?.length || 0} existing appointments`);

  // Gerar slots disponíveis (08:00 às 21:00, intervalos de 30 min)
  const availableSlots: any[] = [];
  const openingHour = 8;
  const closingHour = 21;

  for (let hour = openingHour; hour < closingHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const slotStart = new Date(`${date}T${timeStr}:00`);

      for (const barber of barbers) {
        // Verificar se o barbeiro está ocupado neste horário
        const isOccupied = appointments?.some((apt: any) => {
          if (apt.barber_id !== barber.id) return false;
          const aptStart = new Date(apt.start_time);
          const aptEnd = new Date(apt.end_time);
          return slotStart >= aptStart && slotStart < aptEnd;
        });

        if (!isOccupied) {
          availableSlots.push({
            time: timeStr,
            datetime: slotStart.toISOString(),
            barber_id: barber.id,
            barber_name: barber.name
          });
        }
      }
    }
  }

  console.log(`Generated ${availableSlots.length} available slots`);

  return new Response(
    JSON.stringify({
      success: true,
      date,
      available_slots: availableSlots,
      services: services || []
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Handler para criar agendamento
async function handleCreate(supabase: any, body: any, corsHeaders: any) {
  const { client_name, client_phone, professional, service, datetime, unit_id } = body;

  // Validações
  if (!client_name || !professional || !service || !datetime || !unit_id) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Campos obrigatórios: client_name, professional, service, datetime, unit_id' 
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log(`Creating appointment: ${client_name} with ${professional} for ${service} at ${datetime}`);

  // Buscar o barbeiro pelo nome
  const { data: barbers, error: barberError } = await supabase
    .from('barbers')
    .select('id, name, company_id')
    .eq('unit_id', unit_id)
    .eq('is_active', true)
    .ilike('name', `%${professional}%`)
    .limit(1);

  if (barberError || !barbers || barbers.length === 0) {
    console.error('Barber not found:', barberError);
    return new Response(
      JSON.stringify({ success: false, error: `Barbeiro "${professional}" não encontrado` }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const barber = barbers[0];
  console.log('Found barber:', barber);

  // Buscar o serviço pelo nome
  const { data: services, error: serviceError } = await supabase
    .from('services')
    .select('id, name, price, duration_minutes')
    .eq('unit_id', unit_id)
    .eq('is_active', true)
    .ilike('name', `%${service}%`)
    .limit(1);

  if (serviceError || !services || services.length === 0) {
    console.error('Service not found:', serviceError);
    return new Response(
      JSON.stringify({ success: false, error: `Serviço "${service}" não encontrado` }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const selectedService = services[0];
  console.log('Found service:', selectedService);

  // Calcular end_time
  const startTime = new Date(datetime);
  const endTime = new Date(startTime.getTime() + selectedService.duration_minutes * 60000);

  // Verificar se o horário está disponível
  const { data: conflictingApts, error: conflictError } = await supabase
    .from('appointments')
    .select('id')
    .eq('unit_id', unit_id)
    .eq('barber_id', barber.id)
    .neq('status', 'cancelled')
    .lt('start_time', endTime.toISOString())
    .gt('end_time', startTime.toISOString());

  if (conflictError) {
    console.error('Error checking conflicts:', conflictError);
  }

  if (conflictingApts && conflictingApts.length > 0) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Horário não disponível. ${barber.name} já tem agendamento neste horário.` 
      }),
      { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Criar o agendamento
  const { data: appointment, error: createError } = await supabase
    .from('appointments')
    .insert({
      unit_id,
      company_id: barber.company_id,
      barber_id: barber.id,
      service_id: selectedService.id,
      client_name,
      client_phone: client_phone || null,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      total_price: selectedService.price,
      status: 'pending'
    })
    .select()
    .single();

  if (createError) {
    console.error('Error creating appointment:', createError);
    return new Response(
      JSON.stringify({ success: false, error: 'Erro ao criar agendamento' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('Appointment created:', appointment);

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Agendamento criado com sucesso!',
      appointment: {
        id: appointment.id,
        client_name: appointment.client_name,
        barber: barber.name,
        service: selectedService.name,
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        total_price: appointment.total_price,
        status: appointment.status
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Handler para cancelar agendamento
async function handleCancel(supabase: any, body: any, corsHeaders: any) {
  const { appointment_id, client_phone, unit_id } = body;

  if (!unit_id) {
    return new Response(
      JSON.stringify({ success: false, error: 'unit_id é obrigatório' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!appointment_id && !client_phone) {
    return new Response(
      JSON.stringify({ success: false, error: 'Informe appointment_id ou client_phone' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log(`Cancelling appointment: id=${appointment_id}, phone=${client_phone}, unit=${unit_id}`);

  let query = supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('unit_id', unit_id)
    .in('status', ['pending', 'confirmed']);

  if (appointment_id) {
    query = query.eq('id', appointment_id);
  } else if (client_phone) {
    // Cancelar o próximo agendamento do cliente
    const { data: nextAppointment, error: findError } = await supabase
      .from('appointments')
      .select('id, client_name, start_time')
      .eq('unit_id', unit_id)
      .eq('client_phone', client_phone)
      .in('status', ['pending', 'confirmed'])
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(1);

    if (findError || !nextAppointment || nextAppointment.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Nenhum agendamento futuro encontrado para este telefone' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    query = query.eq('id', nextAppointment[0].id);
    console.log('Found appointment to cancel:', nextAppointment[0]);
  }

  const { data: cancelled, error: cancelError } = await query.select();

  if (cancelError) {
    console.error('Error cancelling appointment:', cancelError);
    return new Response(
      JSON.stringify({ success: false, error: 'Erro ao cancelar agendamento' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!cancelled || cancelled.length === 0) {
    return new Response(
      JSON.stringify({ success: false, error: 'Agendamento não encontrado' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  console.log('Appointment cancelled:', cancelled[0]);

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Agendamento cancelado com sucesso!',
      cancelled_appointment: cancelled[0]
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
