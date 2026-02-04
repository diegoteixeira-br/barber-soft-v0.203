

# Plano: Atualizar Configuracao da Evolution API

## Visao Geral

Ajustar a edge function `evolution-whatsapp` para que as instancias criadas sigam exatamente a configuracao mostrada nos prints da Evolution API, incluindo adicionar suporte para a nova URL de webhook do receptor de opt-out (SAIR).

## Situacao Atual vs Desejada

### 1. Webhook Events
- **Atual**: `["MESSAGES_UPSERT", "CONNECTION_UPDATE"]`
- **Desejado**: `["MESSAGES_UPSERT"]` (apenas este ativo nos prints)

### 2. Configuracoes de Comportamento
- **Atual**: Ja configurado corretamente
- Rejeitar Chamadas: ON
- Ignorar Grupos: ON
- Sempre Online: ON
- Visualizar Mensagens: ON
- Sincronizar Historico Completo: OFF
- Visualizar Status: ON

### 3. Nova URL de Opt-Out
- **URL**: `https://webhook.dtsolucoesdigital.com.br/webhook/receptor-barber`
- Essa URL sera usada para processar respostas de "SAIR" do marketing

## Etapas de Implementacao

### Etapa 1: Adicionar novo secret para URL do Receptor
- Adicionar secret `N8N_OPTOUT_URL` com valor: `https://webhook.dtsolucoesdigital.com.br/webhook/receptor-barber`
- Esse secret sera usado para configurar um segundo webhook se a Evolution API suportar, ou sera documentado para uso no n8n

### Etapa 2: Atualizar payload de criacao de instancia
Modificar o codigo em `supabase/functions/evolution-whatsapp/index.ts`:

```javascript
// ANTES (linha 119-124)
webhook: {
  url: N8N_WEBHOOK_URL,
  byEvents: false,
  base64: true,
  events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE"]
}

// DEPOIS
webhook: {
  url: N8N_WEBHOOK_URL,
  byEvents: false,
  base64: true,
  events: ["MESSAGES_UPSERT"]
}
```

### Etapa 3: Configurar webhook secundario (se suportado)
A Evolution API v2 pode suportar multiplos webhooks. Caso contrario, o n8n principal (chat-barbearia) ja esta configurado para redirecionar mensagens de "SAIR" para o receptor-barber conforme mostrado no workflow.

Se a Evolution suportar webhook por eventos separados, podemos configurar:
- MESSAGES_UPSERT -> chat-barbearia (principal)
- O opt-out e processado pelo proprio n8n que recebe a mensagem e verifica se contem "SAIR"

## Detalhes Tecnicos

### Arquivo a ser modificado
- `supabase/functions/evolution-whatsapp/index.ts`

### Mudancas especificas

1. **Linha 123**: Remover `"CONNECTION_UPDATE"` do array de eventos
2. **Adicionar comentario** explicando o fluxo de opt-out

### Fluxo de Mensagens (baseado no workflow n8n)
```
Cliente envia "SAIR" 
    -> Evolution API 
    -> N8N (chat-barbearia) 
    -> Verifica se e "SAIR"?
        -> SIM: Processa Descadastro (receptor-barber / process-opt-out)
        -> NAO: Continua para Agente Jackson
```

## Resultado Esperado
- Novas instancias criadas terao apenas o evento `MESSAGES_UPSERT` configurado
- Webhook Base64 ativo
- Todas as configuracoes de comportamento aplicadas automaticamente
- Fluxo de opt-out funcionando atraves do n8n

