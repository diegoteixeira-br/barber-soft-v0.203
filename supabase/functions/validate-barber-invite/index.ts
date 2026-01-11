import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generic error messages to prevent information leakage
const GENERIC_ERRORS = {
  invalidToken: "Convite não encontrado ou expirado",
  alreadyUsed: "Este convite já foi utilizado",
  badRequest: "Token de convite inválido",
  internal: "Erro ao validar convite",
};

// Validate UUID format to prevent injection
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const body = await req.json();
    const { token } = body;

    // Validate token format
    if (!token || typeof token !== "string" || !isValidUUID(token)) {
      return new Response(
        JSON.stringify({ error: GENERIC_ERRORS.badRequest }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Validating invite token");

    // Query barber by invite token using service role (bypasses RLS)
    const { data, error: queryError } = await supabaseAdmin
      .from("barbers")
      .select(`
        id,
        name,
        email,
        user_id,
        units!inner(name, company_id),
        companies:units!inner(company_id(name))
      `)
      .eq("invite_token", token)
      .maybeSingle();

    if (queryError) {
      console.error("Query error:", queryError);
      return new Response(
        JSON.stringify({ error: GENERIC_ERRORS.internal }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({ error: GENERIC_ERRORS.invalidToken, valid: false }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (data.user_id) {
      return new Response(
        JSON.stringify({ error: GENERIC_ERRORS.alreadyUsed, valid: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract unit and company info
    const unitData = data.units as any;
    const companyData = (data.companies as any)?.company_id as any;

    // Return only the necessary information (no sensitive data like phone)
    const response = {
      valid: true,
      barber: {
        id: data.id,
        name: data.name,
        email: data.email, // Email is needed for pre-filling the form
        unit_name: unitData?.name || "Unidade",
        company_name: companyData?.name || "Empresa",
      },
    };

    console.log("Token validated successfully");

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in validate-barber-invite:", error);
    return new Response(
      JSON.stringify({ error: GENERIC_ERRORS.internal }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
