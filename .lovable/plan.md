
# Plano de Correção: Bug do Programa de Fidelidade

## Diagnóstico do Problema

Após análise profunda do banco de dados e código, identifiquei que:

1. **O trigger existe e está ativo** - `trigger_sync_client_on_complete` está configurado corretamente para `AFTER INSERT OR UPDATE`

2. **As configurações estão corretas** - O programa de fidelidade está ativado com threshold de 5 cortes e valor mínimo de R$ 29,99

3. **O problema está no trigger** - O `total_visits` incrementa corretamente (ex: cliente "CLIENTE AVULSO" tem 23 visitas), mas `loyalty_cuts` permanece em 0

4. **Causa raiz identificada**: O trigger busca `client_record` uma vez no início e usa esse valor para calcular se atingiu o threshold. Porém, há um problema na lógica de verificação do INSERT vs UPDATE no PostgreSQL

## Solução Proposta

### Parte 1: Corrigir o Trigger do Banco de Dados

Atualizar a função `sync_client_on_appointment_complete` para:
- Usar `TG_OP` para distinguir entre INSERT e UPDATE
- Re-buscar o `client_record` após a atualização de `total_visits` para ter o valor correto de `loyalty_cuts`
- Adicionar logs de debug (temporários) para rastrear a execução

```text
+-------------------+     +------------------+     +-------------------+
|   Appointment     |     |   Trigger        |     |   Cliente         |
|   Completado      |---->|   Executa        |---->|   Atualizado      |
+-------------------+     +------------------+     +-------------------+
                                 |
                                 v
                          +------------------+
                          | Verifica:        |
                          | - Fidelidade ON? |
                          | - Valor >= Min?  |
                          | - Não é cortesia?|
                          +------------------+
                                 |
                      +----------+-----------+
                      |                      |
                      v                      v
               +-------------+        +-------------+
               | Incrementa  |        | Credita     |
               | loyalty_cuts|        | cortesia +  |
               | +1          |        | zera contador|
               +-------------+        +-------------+
```

### Parte 2: Adicionar Notificação Toast no Frontend

Quando o backend detectar que um ciclo foi completado, mostrar toast:
> "Ciclo Completo! O cliente [Nome] ganhou 1 cortesia."

**Implementação:**
1. O trigger não pode enviar notificações diretamente
2. Solução: Após completar um agendamento, o frontend consulta o cliente para verificar se houve mudança em `available_courtesies`
3. Comparar o valor antes e depois - se aumentou, mostrar o toast

### Parte 3: Alterações Necessárias

#### 3.1 Migration SQL (Correção do Trigger)

```sql
CREATE OR REPLACE FUNCTION public.sync_client_on_appointment_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  client_record RECORD;
  fidelity_enabled boolean;
  cuts_threshold integer;
  min_value numeric;
  owner_id uuid;
  should_count_loyalty boolean;
  is_new_status_completed boolean;
BEGIN
  -- Determine if this is a new completion
  IF TG_OP = 'INSERT' THEN
    is_new_status_completed := (NEW.status = 'completed');
  ELSE
    is_new_status_completed := (NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed');
  END IF;

  IF is_new_status_completed THEN
    -- [resto da lógica...]
    
    -- IMPORTANTE: Re-buscar client_record APÓS atualizar total_visits
    -- para ter o valor correto de loyalty_cuts
    SELECT * INTO client_record 
    FROM public.clients 
    WHERE unit_id = NEW.unit_id AND phone = NEW.client_phone;
    
    -- [lógica de fidelidade com client_record atualizado...]
  END IF;
  
  RETURN NEW;
END;
$function$;
```

#### 3.2 Hook useFidelityCourtesy (Nova função para verificar ciclo)

Adicionar função para consultar se o cliente completou um ciclo:
- Buscar `available_courtesies` do cliente
- Comparar com valor anterior (passado como parâmetro)
- Retornar se houve incremento

#### 3.3 AppointmentDetailsModal (Toast de notificação)

Após chamar `onStatusChange("completed", ...)`:
1. Aguardar a mutation completar
2. Consultar `available_courtesies` do cliente
3. Se aumentou em relação ao valor anterior, mostrar toast:
   - Título: "Ciclo Completo!"
   - Descrição: "O cliente [Nome] ganhou 1 cortesia."

### Arquivos a Serem Modificados

| Arquivo | Alteração |
|---------|-----------|
| Nova migration SQL | Corrigir trigger com `TG_OP` e re-fetch do client |
| `src/hooks/useFidelityCourtesy.ts` | Adicionar `checkCycleCompletion()` |
| `src/components/agenda/AppointmentDetailsModal.tsx` | Adicionar lógica de toast após completar |
| `src/hooks/useAppointments.ts` | Retornar dados do cliente após completar para comparação |

### Testes Recomendados

1. Criar um cliente novo com 4 cortes acumulados
2. Completar um serviço com valor >= R$ 30
3. Verificar se `loyalty_cuts` incrementou para 5
4. Se atingiu threshold, verificar se `available_courtesies` = 1 e `loyalty_cuts` = 0
5. Verificar se toast "Ciclo Completo!" apareceu

---

## Seção Técnica

### Detalhes da Correção do Trigger

O problema principal está na condição:
```sql
IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed')
```

Em PostgreSQL, quando `TG_OP = 'INSERT'`, a variável `OLD` é NULL inteira, não apenas seus campos. Usar `OLD.status IS NULL` funciona, mas é mais seguro usar:
```sql
OLD.status IS DISTINCT FROM 'completed'
```

Isso trata corretamente tanto INSERT (onde OLD é NULL) quanto UPDATE.

### Fluxo de Verificação do Ciclo no Frontend

```text
1. Usuário clica "Finalizar"
2. Modal de pagamento abre
3. Usuário seleciona método
4. handlePaymentConfirm() é chamado
   |
   +-> Salva courtesies_before = availableCourtesies (já carregado)
   +-> Chama onStatusChange("completed", ...)
   |
5. Após mutation sucesso:
   +-> Busca availableCourtesies atual do cliente
   +-> Se courtesies_atual > courtesies_before:
       +-> Toast: "Ciclo Completo! [Nome] ganhou 1 cortesia."
```

### Considerações de Segurança

- O trigger usa `SECURITY DEFINER` para ter permissões adequadas
- RLS não interfere pois o trigger executa com privilégios elevados
- Nenhuma alteração nas integrações Evolution API ou Marketing
