-- Atualizar constraint de status para incluir 'em_andamento'
ALTER TABLE reservas DROP CONSTRAINT IF EXISTS reservas_status_check;
ALTER TABLE reservas ADD CONSTRAINT reservas_status_check 
  CHECK (status = ANY (ARRAY['confirmada', 'pendente', 'cancelada', 'finalizada', 'em_andamento']));