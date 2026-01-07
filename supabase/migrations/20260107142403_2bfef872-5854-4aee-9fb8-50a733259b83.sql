-- Add opt-out columns to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS marketing_opt_out BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS opted_out_at TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN public.clients.marketing_opt_out IS 'Cliente não quer receber mensagens de marketing';
COMMENT ON COLUMN public.clients.opted_out_at IS 'Data/hora em que o cliente solicitou opt-out';

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_clients_marketing_opt_out ON public.clients(marketing_opt_out) WHERE marketing_opt_out = true;