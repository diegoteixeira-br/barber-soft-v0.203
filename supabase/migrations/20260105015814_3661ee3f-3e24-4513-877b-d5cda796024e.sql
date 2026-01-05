-- Create cancellation_history table
CREATE TABLE public.cancellation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_id UUID NOT NULL,
  company_id UUID,
  appointment_id UUID,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  barber_name TEXT NOT NULL,
  service_name TEXT NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  cancelled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  minutes_before INTEGER NOT NULL DEFAULT 0,
  is_late_cancellation BOOLEAN NOT NULL DEFAULT false,
  is_no_show BOOLEAN NOT NULL DEFAULT false,
  total_price NUMERIC NOT NULL DEFAULT 0,
  cancellation_source TEXT NOT NULL DEFAULT 'manual',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cancellation_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view cancellation history from their units"
ON public.cancellation_history
FOR SELECT
USING (user_owns_unit(unit_id));

CREATE POLICY "Users can create cancellation history in their units"
ON public.cancellation_history
FOR INSERT
WITH CHECK (user_owns_unit(unit_id));

CREATE POLICY "Users can delete cancellation history from their units"
ON public.cancellation_history
FOR DELETE
USING (user_owns_unit(unit_id));

-- Create index for performance
CREATE INDEX idx_cancellation_history_unit_id ON public.cancellation_history(unit_id);
CREATE INDEX idx_cancellation_history_scheduled_time ON public.cancellation_history(scheduled_time);
CREATE INDEX idx_cancellation_history_is_late ON public.cancellation_history(is_late_cancellation) WHERE is_late_cancellation = true;