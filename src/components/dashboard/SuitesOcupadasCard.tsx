import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Building2 } from 'lucide-react';

interface SuitesOcupadasCardProps {
  ocupadas: number;
  total: number;
  percentual: number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function SuitesOcupadasCard({
  ocupadas,
  total,
  percentual,
  trend,
}: SuitesOcupadasCardProps) {
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Suítes Ocupadas</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-card-foreground">{ocupadas}/{total}</p>
            <span className="text-lg font-medium text-primary">({percentual}%)</span>
          </div>
          {trend && (
            <p
              className={cn(
                'text-sm font-medium',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}% vs mês anterior
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-primary/20">
          <Building2 size={24} className="text-accent" />
        </div>
      </div>
      
      {/* Barra de progresso visual */}
      <div className="mt-4">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${percentual}%` }}
          />
        </div>
      </div>
    </div>
  );
}
