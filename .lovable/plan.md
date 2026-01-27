
# Plano: Sistema de Controle de Parceiros

## Visao Geral
Implementar um sistema completo de gestao de parceiros para barbearias que recebem acesso gratuito por um periodo especifico, com possibilidade de renovacao ou migracao para um plano pago quando o periodo expirar.

## Alteracoes no Banco de Dados

### Novos Campos na Tabela `companies`
Adicionar campos especificos para controle de parcerias:

```sql
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS is_partner BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS partner_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS partner_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS partner_notes TEXT,
  ADD COLUMN IF NOT EXISTS partner_renewed_count INTEGER DEFAULT 0;
```

- **is_partner**: Indica se a barbearia e um parceiro
- **partner_started_at**: Data de inicio da parceria
- **partner_ends_at**: Data de termino da parceria
- **partner_notes**: Notas/observacoes sobre a parceria
- **partner_renewed_count**: Quantas vezes a parceria foi renovada

### Novo Valor de plan_status
Adicionar `partner` como um status valido para distinguir parceiros de trials e assinaturas pagas.

## Alteracoes no Frontend

### 1. Atualizar Interface da Tabela de Barbearias

**Arquivo**: `src/components/admin/CompaniesTable.tsx`

Alteracoes:
- Adicionar badge visual "Parceiro" em roxo/verde para identificar parceiros
- Mostrar data de termino da parceria quando aplicavel
- Novas opcoes no menu dropdown:
  - "Ativar Parceria" - abre modal para configurar
  - "Renovar Parceria" - para parceiros existentes
  - "Encerrar Parceria" - converte para status trial ou cancellled

### 2. Criar Modal de Gestao de Parceria

**Novo Arquivo**: `src/components/admin/PartnershipModal.tsx`

Funcionalidades:
- Campo para selecionar duracao da parceria (ex: 1 mes, 3 meses, 6 meses, 1 ano, personalizado)
- Seletor de data de inicio e fim
- Campo de notas/observacoes
- Seletor de plano que o parceiro tera acesso (Inicial, Profissional, Franquias)
- Historico de renovacoes anteriores
- Botao de confirmar ativacao/renovacao

### 3. Atualizar Modal de Detalhes da Empresa

**Arquivo**: `src/components/admin/CompanyDetailsModal.tsx`

Adicionar secao de parceria mostrando:
- Status de parceiro (Sim/Nao)
- Data de inicio da parceria
- Data de termino da parceria
- Dias restantes
- Numero de renovacoes
- Notas da parceria

### 4. Atualizar Hook de Admin Companies

**Arquivo**: `src/hooks/useAdminCompanies.ts`

Novas funcoes:
- `activatePartnership({ companyId, planType, startsAt, endsAt, notes })` - Ativa parceria
- `renewPartnership({ companyId, additionalDays, notes })` - Renova parceria existente
- `endPartnership({ companyId, convertToTrial })` - Encerra parceria

Atualizar interface `AdminCompany` com novos campos:
- is_partner
- partner_started_at
- partner_ends_at
- partner_notes
- partner_renewed_count

### 5. Atualizar Cores/Badges de Status

**Arquivo**: `src/components/admin/CompaniesTable.tsx`

```typescript
const statusColors = {
  trial: "bg-yellow-500/20 text-yellow-400",
  active: "bg-green-500/20 text-green-400",
  partner: "bg-purple-500/20 text-purple-400",  // NOVO
  cancelled: "bg-slate-500/20 text-slate-400",
  overdue: "bg-red-500/20 text-red-400",
};
```

## Logica de Expiracao de Parceria

### Verificacao no Edge Function `check-subscription`

**Arquivo**: `supabase/functions/check-subscription/index.ts`

Adicionar logica para verificar se a parceria expirou:

```typescript
// Se e parceiro, verificar se ainda esta valido
if (company.is_partner && company.partner_ends_at) {
  const partnerEndsAt = new Date(company.partner_ends_at);
  if (partnerEndsAt > new Date()) {
    // Parceria ainda valida
    return { subscribed: true, plan_status: 'partner', ... };
  } else {
    // Parceria expirou - atualizar status no banco
    await updateCompanyStatus(company.id, 'expired_partner');
  }
}
```

### Fluxo Quando Parceria Expira

1. O parceiro continua com acesso aos dados (clientes, agendamentos, etc.)
2. O sistema mostra banner informando que a parceria expirou
3. O parceiro pode:
   - Aguardar renovacao pelo super admin
   - Contratar um plano pago normalmente

## Componentes a Serem Criados/Modificados

| Componente | Acao | Descricao |
|------------|------|-----------|
| `PartnershipModal.tsx` | Criar | Modal para ativar/renovar parceria |
| `CompaniesTable.tsx` | Modificar | Adicionar badge e acoes de parceiro |
| `CompanyDetailsModal.tsx` | Modificar | Mostrar info de parceria |
| `useAdminCompanies.ts` | Modificar | Adicionar funcoes de parceria |
| `check-subscription/index.ts` | Modificar | Verificar status de parceiro |

## Interface do Modal de Parceria

```text
+--------------------------------------------------+
|         Gerenciar Parceria                       |
+--------------------------------------------------+
|                                                  |
|  Barbearia: [Nome da Barbearia]                  |
|                                                  |
|  Plano com Acesso:                               |
|  [ ] Inicial  [x] Profissional  [ ] Franquias    |
|                                                  |
|  Periodo da Parceria:                            |
|  [Selecione] v   ou   Personalizado              |
|  - 1 mes                                         |
|  - 3 meses                                       |
|  - 6 meses                                       |
|  - 1 ano                                         |
|                                                  |
|  Data Inicio: [27/01/2026]                       |
|  Data Termino: [27/01/2027]                      |
|                                                  |
|  Notas/Observacoes:                              |
|  +----------------------------------------------+|
|  | Parceria fechada na feira de negocios...     ||
|  +----------------------------------------------+|
|                                                  |
|  Historico: 0 renovacoes anteriores              |
|                                                  |
|       [Cancelar]    [Ativar Parceria]            |
+--------------------------------------------------+
```

## Secao Tecnica

### Migracao SQL Completa

```sql
-- Campos para controle de parcerias
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS is_partner BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS partner_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS partner_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS partner_notes TEXT,
  ADD COLUMN IF NOT EXISTS partner_renewed_count INTEGER DEFAULT 0;

-- Indice para consultas de parceiros
CREATE INDEX IF NOT EXISTS idx_companies_partner 
  ON public.companies (is_partner, partner_ends_at);
```

### Atualizacao do Hook useAdminCompanies

```typescript
// Nova interface
export interface AdminCompany {
  // ... campos existentes ...
  is_partner: boolean | null;
  partner_started_at: string | null;
  partner_ends_at: string | null;
  partner_notes: string | null;
  partner_renewed_count: number | null;
}

// Nova mutation para ativar parceria
const activatePartnershipMutation = useMutation({
  mutationFn: async ({ 
    companyId, 
    planType, 
    startsAt, 
    endsAt, 
    notes 
  }: ActivatePartnershipParams) => {
    const { error } = await supabase
      .from("companies")
      .update({
        is_partner: true,
        plan_status: 'partner',
        plan_type: planType,
        partner_started_at: startsAt,
        partner_ends_at: endsAt,
        partner_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq("id", companyId);
    
    if (error) throw error;
  },
  onSuccess: () => {
    toast.success("Parceria ativada com sucesso");
    queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
  }
});

// Nova mutation para renovar parceria
const renewPartnershipMutation = useMutation({
  mutationFn: async ({ companyId, newEndDate, notes }) => {
    const company = companies.find(c => c.id === companyId);
    const { error } = await supabase
      .from("companies")
      .update({
        partner_ends_at: newEndDate,
        partner_notes: notes,
        partner_renewed_count: (company?.partner_renewed_count || 0) + 1,
        plan_status: 'partner',
        updated_at: new Date().toISOString()
      })
      .eq("id", companyId);
    
    if (error) throw error;
  }
});
```

### Logica de Verificacao no check-subscription

```typescript
// Verificar se e parceiro ativo
if (company.is_partner && company.partner_ends_at) {
  const partnerEnds = new Date(company.partner_ends_at);
  const now = new Date();
  
  if (partnerEnds > now) {
    // Parceria valida
    return new Response(JSON.stringify({
      subscribed: true,
      plan_status: 'partner',
      plan_type: company.plan_type,
      partner_ends_at: company.partner_ends_at,
      days_remaining: Math.ceil((partnerEnds - now) / (1000 * 60 * 60 * 24))
    }), { headers: corsHeaders, status: 200 });
  } else {
    // Parceria expirou - manter dados, atualizar status
    await supabaseClient
      .from("companies")
      .update({ plan_status: 'expired_partner' })
      .eq("id", company.id);
    
    return new Response(JSON.stringify({
      subscribed: false,
      plan_status: 'expired_partner',
      partner_expired: true,
      partner_ended_at: company.partner_ends_at
    }), { headers: corsHeaders, status: 200 });
  }
}
```

## Resumo de Arquivos

### Novos Arquivos
1. `src/components/admin/PartnershipModal.tsx` - Modal de gestao de parceria

### Arquivos Modificados
1. `src/components/admin/CompaniesTable.tsx` - Badges e acoes de parceiro
2. `src/components/admin/CompanyDetailsModal.tsx` - Secao de info de parceria
3. `src/hooks/useAdminCompanies.ts` - Funcoes de CRUD de parceria
4. `supabase/functions/check-subscription/index.ts` - Verificacao de parceiro
5. Migracao SQL para novos campos

### Ordem de Implementacao
1. Migracao SQL (adicionar campos)
2. Atualizar hook useAdminCompanies
3. Criar PartnershipModal
4. Atualizar CompaniesTable
5. Atualizar CompanyDetailsModal
6. Atualizar check-subscription
