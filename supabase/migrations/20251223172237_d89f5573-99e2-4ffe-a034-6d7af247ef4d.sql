-- ===========================================
-- MARKETING MODULE: Add automation settings
-- ===========================================

-- Add automation fields to business_settings
ALTER TABLE public.business_settings 
ADD COLUMN birthday_automation_enabled BOOLEAN DEFAULT false,
ADD COLUMN birthday_message_template TEXT DEFAULT 'Olá {{nome}}! 🎂 Feliz aniversário! A equipe deseja um dia incrível. Venha comemorar conosco!',
ADD COLUMN rescue_automation_enabled BOOLEAN DEFAULT false,
ADD COLUMN rescue_days_threshold INTEGER DEFAULT 30,
ADD COLUMN rescue_message_template TEXT DEFAULT 'Olá {{nome}}! Sentimos sua falta! 💈 Já faz um tempo desde sua última visita. Que tal agendar um horário?';