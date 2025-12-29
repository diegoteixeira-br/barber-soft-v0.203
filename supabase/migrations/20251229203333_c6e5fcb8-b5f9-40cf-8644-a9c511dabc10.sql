-- Adicionar coluna evolution_instance_name na tabela units
ALTER TABLE public.units 
ADD COLUMN evolution_instance_name text UNIQUE;

-- Criar índice para busca rápida por instance_name
CREATE INDEX idx_units_evolution_instance_name 
ON public.units(evolution_instance_name) 
WHERE evolution_instance_name IS NOT NULL;