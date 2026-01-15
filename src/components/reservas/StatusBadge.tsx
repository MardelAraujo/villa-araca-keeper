import { cn } from '@/lib/utils';
import {
  StatusReserva,
  StatusPagamento,
  statusReservaLabels,
  statusPagamentoLabels,
} from '@/types';

interface StatusBadgeProps {
  status: StatusReserva | StatusPagamento;
  type: 'reserva' | 'pagamento';
}

const reservaColors: Record<StatusReserva, string> = {
  solicitacao: 'bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]',
  confirmada: 'bg-primary text-primary-foreground',
  em_andamento: 'bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]',
  finalizada: 'bg-muted text-muted-foreground',
  cancelada: 'bg-destructive text-destructive-foreground',
};

const pagamentoColors: Record<StatusPagamento, string> = {
  pendente: 'bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]',
  pago_50: 'bg-primary text-primary-foreground',
  pago_integral: 'bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]',
  reembolsado: 'bg-muted text-muted-foreground',
};

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const colors =
    type === 'reserva'
      ? reservaColors[status as StatusReserva]
      : pagamentoColors[status as StatusPagamento];

  const label =
    type === 'reserva'
      ? statusReservaLabels[status as StatusReserva]
      : statusPagamentoLabels[status as StatusPagamento];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        colors
      )}
    >
      {label}
    </span>
  );
}
