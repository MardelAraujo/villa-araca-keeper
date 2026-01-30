import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { SuitesOcupadasCard } from '@/components/dashboard/SuitesOcupadasCard';
import { OccupancyPlanner } from '@/components/dashboard/OccupancyPlanner';
import { useSuitesOcupadas } from '@/hooks/useSuites';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { format, isToday, parseISO } from 'date-fns';

const Index = () => {
  const { t, language } = useLanguage();
  const { data: suitesData, isLoading: loadingSuites } = useSuitesOcupadas();
  
  // Fetch real stats from database
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Check-ins today
      const { data: checkIns } = await supabase
        .from('reservas')
        .select('id')
        .eq('data_checkin', today)
        .not('status', 'eq', 'cancelada');
      
      // Check-outs today
      const { data: checkOuts } = await supabase
        .from('reservas')
        .select('id')
        .eq('data_checkout', today)
        .not('status', 'eq', 'cancelada');
      
      // Monthly revenue (sum of valor_total for reservations with checkin this month)
      const startOfMonth = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');
      const endOfMonth = format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), 'yyyy-MM-dd');
      
      const { data: monthlyReservations } = await supabase
        .from('reservas')
        .select('valor_total, valor_pago')
        .gte('data_checkin', startOfMonth)
        .lte('data_checkin', endOfMonth)
        .not('status', 'eq', 'cancelada');
      
      const receitaMes = monthlyReservations?.reduce((acc, r) => acc + (r.valor_total || 0), 0) || 0;
      const receitaConfirmada = monthlyReservations?.reduce((acc, r) => acc + (r.valor_pago || 0), 0) || 0;
      
      return {
        checkInsHoje: checkIns?.length || 0,
        checkOutsHoje: checkOuts?.length || 0,
        receitaMes,
        receitaConfirmada,
        receitaPendente: receitaMes - receitaConfirmada,
      };
    },
  });

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
          value={stats?.checkInsHoje ?? 0}
          icon={<ArrowUpRight size={24} />}
          variant="success"
        />
        <StatCard
          title={t('dashboard.todayCheckouts')}
          value={stats?.checkOutsHoje ?? 0}
          icon={<ArrowDownRight size={24} />}
          variant="warning"
        />
        <SuitesOcupadasCard
          ocupadas={suitesData?.ocupadas ?? 0}
          total={suitesData?.totalSuites ?? 6}
          percentual={suitesData?.percentual ?? 0}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title={t('dashboard.monthlyRevenue')}
          value={formatCurrency(stats?.receitaMes ?? 0)}
          icon={<DollarSign size={24} />}
          variant="primary"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Occupancy Planner - Takes 3 columns */}
        <div className="lg:col-span-3">
          <OccupancyPlanner />
        </div>

        {/* Sidebar with Actions and Revenue */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign size={18} className="text-primary" />
                {t('dashboard.monthlyRevenue')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-card-foreground">
                {formatCurrency(stats?.receitaMes ?? 0)}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('status.confirmed')}</span>
                  <span className="font-medium">
                    {formatCurrency(stats?.receitaConfirmada ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('status.pending')}</span>
                  <span className="font-medium">{formatCurrency(stats?.receitaPendente ?? 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users size={18} className="text-primary" />
                {language === 'pt' ? 'Ações Rápidas' : 'Azioni Rapide'}
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
