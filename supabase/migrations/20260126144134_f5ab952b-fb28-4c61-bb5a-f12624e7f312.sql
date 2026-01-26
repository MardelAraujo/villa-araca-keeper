-- =====================================================
-- TABELA: SUITES
-- =====================================================
CREATE TABLE public.suites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cor_identificacao TEXT,
  status TEXT NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'ocupada', 'manutencao')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índice para busca por status
CREATE INDEX idx_suites_status ON public.suites(status);

-- Habilitar RLS
ALTER TABLE public.suites ENABLE ROW LEVEL SECURITY;

-- Política de acesso público (leitura e escrita)
CREATE POLICY "Permitir todas operações em suites" ON public.suites FOR ALL USING (true) WITH CHECK (true);

-- Inserir dados iniciais das suítes
INSERT INTO public.suites (nome, cor_identificacao, status) VALUES
  ('Suite Verde', '#4CAF50', 'disponivel'),
  ('Suite Azul', '#2196F3', 'disponivel'),
  ('Suite Abacate', '#8BC34A', 'disponivel'),
  ('Suite Amarela', '#FFC107', 'disponivel'),
  ('Suite Laranja', '#FF9800', 'disponivel'),
  ('Suite Master', '#E2B6BB', 'disponivel');

-- =====================================================
-- TABELA: HOSPEDES
-- =====================================================
CREATE TABLE public.hospedes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cpf TEXT,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  pais TEXT DEFAULT 'Brasil',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para busca
CREATE INDEX idx_hospedes_nome ON public.hospedes(nome);
CREATE INDEX idx_hospedes_cpf ON public.hospedes(cpf);
CREATE INDEX idx_hospedes_email ON public.hospedes(email);

-- Habilitar RLS
ALTER TABLE public.hospedes ENABLE ROW LEVEL SECURITY;

-- Política de acesso público
CREATE POLICY "Permitir todas operações em hospedes" ON public.hospedes FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- TABELA: RESERVAS
-- =====================================================
CREATE TABLE public.reservas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_booking TEXT UNIQUE,
  suite_id UUID NOT NULL REFERENCES public.suites(id) ON DELETE RESTRICT,
  hospede_id UUID NOT NULL REFERENCES public.hospedes(id) ON DELETE RESTRICT,
  data_checkin DATE NOT NULL,
  data_checkout DATE NOT NULL,
  numero_hospedes INTEGER DEFAULT 1,
  valor_total DECIMAL(10,2) DEFAULT 0,
  valor_pago DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('confirmada', 'pendente', 'cancelada', 'finalizada')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Colunas calculadas via geradas
ALTER TABLE public.reservas ADD COLUMN valor_pendente DECIMAL(10,2) GENERATED ALWAYS AS (valor_total - valor_pago) STORED;
ALTER TABLE public.reservas ADD COLUMN percentual_pago DECIMAL(5,2) GENERATED ALWAYS AS (
  CASE WHEN valor_total > 0 THEN ROUND((valor_pago / valor_total) * 100, 2) ELSE 0 END
) STORED;

-- Índices para performance
CREATE INDEX idx_reservas_suite_id ON public.reservas(suite_id);
CREATE INDEX idx_reservas_hospede_id ON public.reservas(hospede_id);
CREATE INDEX idx_reservas_data_checkin ON public.reservas(data_checkin);
CREATE INDEX idx_reservas_data_checkout ON public.reservas(data_checkout);
CREATE INDEX idx_reservas_status ON public.reservas(status);

-- Habilitar RLS
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

-- Política de acesso público
CREATE POLICY "Permitir todas operações em reservas" ON public.reservas FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- TABELA: DOCUMENTOS
-- =====================================================
CREATE TABLE public.documentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reserva_id UUID REFERENCES public.reservas(id) ON DELETE CASCADE,
  hospede_id UUID NOT NULL REFERENCES public.hospedes(id) ON DELETE CASCADE,
  tipo_documento TEXT NOT NULL,
  numero_documento TEXT,
  arquivo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_documentos_reserva_id ON public.documentos(reserva_id);
CREATE INDEX idx_documentos_hospede_id ON public.documentos(hospede_id);
CREATE INDEX idx_documentos_tipo ON public.documentos(tipo_documento);

-- Habilitar RLS
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

-- Política de acesso público
CREATE POLICY "Permitir todas operações em documentos" ON public.documentos FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para hospedes
CREATE TRIGGER update_hospedes_updated_at
  BEFORE UPDATE ON public.hospedes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para reservas
CREATE TRIGGER update_reservas_updated_at
  BEFORE UPDATE ON public.reservas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para gerar código de reserva automático
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
$$ LANGUAGE plpgsql;

-- Trigger para gerar código de reserva
CREATE TRIGGER generate_reserva_booking_code
  BEFORE INSERT ON public.reservas
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_booking_code();