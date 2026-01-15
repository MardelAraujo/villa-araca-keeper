import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ReservaCard } from '@/components/reservas/ReservaCard';
import { dashboardStats, mockReservas } from '@/data/mock';
import {
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const { t } = useLanguage();
  
  const proximasReservas = mockReservas
    .filter(
      (r) =>
        r.status_reserva === 'confirmada' || r.status_reserva === 'solicitacao'
    )
    .slice(0, 3);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <MainLayout title={t('dashboard.title')} subtitle={t('dashboard.subtitle')}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={t('dashboard.todayCheckins')}
          value={dashboardStats.checkInsHoje}
          icon={<ArrowUpRight size={24} />}
          variant="success"
        />
        <StatCard
          title={t('dashboard.todayCheckouts')}
          value={dashboardStats.checkOutsHoje}
          icon={<ArrowDownRight size={24} />}
          variant="warning"
        />
        <StatCard
          title={t('dashboard.occupancyRate')}
          value={`${dashboardStats.ocupacao}%`}
          icon={<TrendingUp size={24} />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title={t('dashboard.monthlyRevenue')}
          value={formatCurrency(dashboardStats.receitaMes)}
          icon={<DollarSign size={24} />}
          variant="primary"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximas Reservas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t('dashboard.recentReservations')}</h2>
            <Link to="/reservas">
              <Button variant="outline" size="sm">
                {t('dashboard.viewAll')}
              </Button>
            </Link>
          </div>
          <div className="grid gap-4">
            {proximasReservas.map((reserva) => (
              <ReservaCard key={reserva.id} reserva={reserva} />
            ))}
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t('dashboard.monthlyRevenue')}</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign size={18} className="text-primary" />
                {t('dashboard.monthlyRevenue')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-card-foreground">
                {formatCurrency(dashboardStats.receitaMes)}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('status.confirmed')}</span>
                  <span className="font-medium">
                    {formatCurrency(8500)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('status.pending')}</span>
                  <span className="font-medium">{formatCurrency(4000)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users size={18} className="text-primary" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/reservas/nova" className="block">
                <Button className="w-full" variant="default">
                  {t('reservations.newReservation')}
                </Button>
              </Link>
              <Link to="/hospedes/novo" className="block">
                <Button className="w-full" variant="outline">
                  {t('guests.newGuest')}
                </Button>
              </Link>
              <Link to="/importar" className="block">
                <Button className="w-full" variant="secondary">
                  {t('nav.import')} Booking
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
