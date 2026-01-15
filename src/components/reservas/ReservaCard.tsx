import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Users, CreditCard, MapPin } from 'lucide-react';
import { Reserva, canalOrigemLabels } from '@/types';
import { StatusBadge } from './StatusBadge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface ReservaCardProps {
  reserva: Reserva;
}

export function ReservaCard({ reserva }: ReservaCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Link to={`/reservas/${reserva.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-card-foreground">
                {reserva.hospede?.nome_completo}
              </h3>
              <p className="text-sm text-muted-foreground">
                {canalOrigemLabels[reserva.canal_origem]}
                {reserva.codigo_reserva_externa &&
                  ` • ${reserva.codigo_reserva_externa}`}
              </p>
            </div>
            <StatusBadge status={reserva.status_reserva} type="reserva" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar size={16} />
              <span>
                {format(new Date(reserva.check_in), 'dd/MM', { locale: ptBR })} -{' '}
                {format(new Date(reserva.check_out), 'dd/MM', { locale: ptBR })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users size={16} />
              <span>
                {reserva.numero_hospedes}{' '}
                {reserva.numero_hospedes > 1 ? 'hóspedes' : 'hóspede'}
              </span>
            </div>
            {reserva.tipo_quarto && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin size={16} />
                <span>{reserva.tipo_quarto}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard size={16} />
              <span>{formatCurrency(reserva.valor_total)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <StatusBadge status={reserva.status_pagamento} type="pagamento" />
            <span className="text-sm text-muted-foreground">
              Pago: {formatCurrency(reserva.valor_pago)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
