-- Funcao is_super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean 
LANGUAGE sql 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
$$;

-- Tabela saas_settings (configuracoes globais)
CREATE TABLE public.saas_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_mode TEXT DEFAULT 'test',
  stripe_test_publishable_key TEXT,
  stripe_test_secret_key TEXT,
  stripe_live_publishable_key TEXT,
  stripe_live_secret_key TEXT,
  stripe_webhook_secret TEXT,
  default_trial_days INTEGER DEFAULT 14,
  professional_plan_price NUMERIC DEFAULT 149.90,
  elite_plan_price NUMERIC DEFAULT 249.90,
  empire_plan_price NUMERIC DEFAULT 449.90,
  maintenance_mode BOOLEAN DEFAULT false,
  maintenance_message TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID
);

ALTER TABLE public.saas_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admin full access on saas_settings"
  ON public.saas_settings FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Tabela page_visits
CREATE TABLE public.page_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visited_at TIMESTAMPTZ DEFAULT now(),
  page_path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  session_id TEXT
);

ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admin can read visits"
  ON public.page_visits FOR SELECT
  USING (is_super_admin());
CREATE POLICY "Anyone can insert visits"
  ON public.page_visits FOR INSERT
  WITH CHECK (true);

-- Tabela feedbacks
CREATE TABLE public.feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'feedback',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create feedbacks"
  ON public.feedbacks FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own feedbacks"
  ON public.feedbacks FOR SELECT
  USING (auth.uid() = user_id OR is_super_admin());
CREATE POLICY "Super admin can update feedbacks"
  ON public.feedbacks FOR UPDATE
  USING (is_super_admin());

-- Colunas extras em companies
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'professional',
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '14 days'),
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS signup_source TEXT,
  ADD COLUMN IF NOT EXISTS monthly_price NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Policy super admin para companies (adicional)
CREATE POLICY "Super admin can read all companies"
  ON public.companies FOR SELECT
  USING (is_super_admin());

CREATE POLICY "Super admin can update all companies"
  ON public.companies FOR UPDATE
  USING (is_super_admin());

-- Inserir registro inicial em saas_settings
INSERT INTO public.saas_settings (id) VALUES (gen_random_uuid());