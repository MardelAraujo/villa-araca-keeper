// Tipos base do sistema Villa Araçá

export type CanalOrigem = 'booking' | 'whatsapp' | 'direto' | 'airbnb';
export type StatusReserva = 'solicitacao' | 'confirmada' | 'em_andamento' | 'finalizada' | 'cancelada';
export type StatusPagamento = 'pendente' | 'pago_50' | 'pago_integral' | 'reembolsado';
export type IdiomaPreferencial = 'pt' | 'it' | 'en';
export type TipoDocumento = 'comprovante_pagamento' | 'consumo_restaurante' | 'consumo_frigobar' | 'contrato_assinado' | 'outros';

export interface Hospede {
  id: string;
  nome_completo: string;
  email: string;
  telefone: string;
  documento?: string;
  nacionalidade?: string;
  idioma_preferencial: IdiomaPreferencial;
  observacoes_internas?: string;
  data_criacao: Date;
  total_reservas?: number;
  total_gasto?: number;
}

export interface Reserva {
  id: string;
  id_hospede: string;
  hospede?: Hospede;
  canal_origem: CanalOrigem;
  codigo_reserva_externa?: string;
  check_in: Date;
  check_out: Date;
  numero_hospedes: number;
  tipo_quarto?: string;
  valor_total: number;
  valor_pago: number;
  status_reserva: StatusReserva;
  status_pagamento: StatusPagamento;
  data_solicitacao: Date;
  data_confirmacao?: Date;
  observacoes?: string;
}

export interface DocumentoLancamento {
  id: string;
  id_reserva: string;
  tipo_documento: TipoDocumento;
  descricao: string;
  valor: number;
  arquivo_url?: string;
  arquivo_nome?: string;
  data_registro: Date;
  criado_por?: string;
}

// Labels traduzidos
export const statusReservaLabels: Record<StatusReserva, string> = {
  solicitacao: 'Solicitação',
  confirmada: 'Confirmada',
  em_andamento: 'Em Andamento',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
};

export const statusPagamentoLabels: Record<StatusPagamento, string> = {
  pendente: 'Pendente',
  pago_50: 'Pago 50%',
  pago_integral: 'Pago Integral',
  reembolsado: 'Reembolsado',
};

export const canalOrigemLabels: Record<CanalOrigem, string> = {
  booking: 'Booking',
  whatsapp: 'WhatsApp',
  direto: 'Direto',
  airbnb: 'Airbnb',
};

export const tipoDocumentoLabels: Record<TipoDocumento, string> = {
  comprovante_pagamento: 'Comprovante de Pagamento',
  consumo_restaurante: 'Consumo Restaurante',
  consumo_frigobar: 'Consumo Frigobar',
  contrato_assinado: 'Contrato Assinado',
  outros: 'Outros',
};
