-- Corrigir search_path nas funções
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

CREATE OR REPLACE FUNCTION public.generate_booking_code()
RETURNS TRIGGER AS $$
DECLARE
  year_str TEXT;
  seq_num INTEGER;
BEGIN
  IF NEW.codigo_booking IS NULL THEN
    year_str := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    SELECT COALESCE(MAX(CAST(SUBSTRING(codigo_booking FROM 10 FOR 6) AS INTEGER)), 0) + 1
    INTO seq_num
    FROM public.reservas
    WHERE codigo_booking LIKE 'BKG-' || year_str || '-%';
    
    NEW.codigo_booking := 'BKG-' || year_str || '-' || LPAD(seq_num::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;