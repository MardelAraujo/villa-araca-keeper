import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  variant = 'default',
}: StatCardProps) {
  const iconColors = {
    default: 'bg-secondary text-secondary-foreground',
    primary: 'bg-primary text-primary-foreground',
    success: 'bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]',
    warning: 'bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]',
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-card-foreground">{value}</p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {trend && (
            <p
              className={cn(
                'text-sm font-medium',
                trend.isPositive ? 'text-[hsl(var(--success))]' : 'text-destructive'
              )}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}% vs mês anterior
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', iconColors[variant])}>{icon}</div>
      </div>
    </div>
  );
}
