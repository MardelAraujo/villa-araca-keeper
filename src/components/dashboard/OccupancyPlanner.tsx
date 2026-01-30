import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, Home } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, parseISO, addMonths, subMonths } from 'date-fns';
import { ptBR, it } from 'date-fns/locale';

interface Suite {
  id: string;
  nome: string;
  cor_identificacao: string | null;
  status: string;
}

interface Reserva {
  id: string;
  hospede_id: string;
  suite_id: string;
  data_checkin: string;
  data_checkout: string;
  numero_hospedes: number | null;
  valor_total: number | null;
  status: string;
  codigo_booking: string | null;
  hospede?: {
    nome: string;
  };
  suite?: Suite;
}

export function OccupancyPlanner() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());

  const locale = language === 'pt' ? ptBR : it;

  const labels = {
    pt: {
      title: 'Planner de Ocupação',
      today: 'Hoje',
      guests: 'hóspedes',
      checkIn: 'Check-in',
      checkOut: 'Check-out',
      status: 'Status',
      value: 'Valor',
      clickToOpen: 'Clique para ver detalhes',
      noReservation: 'Disponível',
    },
    it: {
      title: 'Planner Occupazione',
      today: 'Oggi',
      guests: 'ospiti',
      checkIn: 'Check-in',
      checkOut: 'Check-out',
      status: 'Stato',
      value: 'Valore',
      clickToOpen: 'Clicca per vedere i dettagli',
      noReservation: 'Disponibile',
    },
  };

  const l = labels[language];

  // Fetch suites
  const { data: suites = [] } = useQuery({
    queryKey: ['suites-planner'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suites')
        .select('*')
        .order('nome');
      if (error) throw error;
      return data as Suite[];
    },
  });

  // Fetch reservations for the current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const { data: reservas = [] } = useQuery({
    queryKey: ['reservas-planner', format(currentDate, 'yyyy-MM')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservas')
        .select(`
          *,
          hospede:hospedes(nome),
          suite:suites(*)
        `)
        .or(`data_checkin.lte.${format(monthEnd, 'yyyy-MM-dd')},data_checkout.gte.${format(monthStart, 'yyyy-MM-dd')}`)
        .not('status', 'eq', 'cancelada');
      if (error) throw error;
      return data as Reserva[];
    },
  });

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [currentDate]);

  const getReservationForDaySuite = (day: Date, suiteId: string): Reserva | null => {
    return reservas.find((reserva) => {
      if (reserva.suite_id !== suiteId) return false;
      const checkin = parseISO(reserva.data_checkin);
      const checkout = parseISO(reserva.data_checkout);
      return isWithinInterval(day, { start: checkin, end: checkout }) || 
             isSameDay(day, checkin) || 
             isSameDay(day, checkout);
    }) || null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada':
        return 'bg-primary/80';
      case 'em_andamento':
        return 'bg-success';
      case 'pendente':
        return 'bg-warning';
      case 'finalizada':
        return 'bg-muted-foreground/50';
      default:
        return 'bg-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, Record<string, string>> = {
      confirmada: { pt: 'Confirmada', it: 'Confermata' },
      em_andamento: { pt: 'Em Andamento', it: 'In Corso' },
      pendente: { pt: 'Pendente', it: 'In Attesa' },
      finalizada: { pt: 'Finalizada', it: 'Completata' },
    };
    return statusMap[status]?.[language] || status;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleCellClick = (reserva: Reserva | null) => {
    if (reserva) {
      navigate(`/reservas/${reserva.id}`);
    }
  };

  const isToday = (day: Date) => isSameDay(day, new Date());
  const isCheckInDay = (day: Date, reserva: Reserva) => isSameDay(day, parseISO(reserva.data_checkin));
  const isCheckOutDay = (day: Date, reserva: Reserva) => isSameDay(day, parseISO(reserva.data_checkout));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarIcon size={20} className="text-primary" />
            {l.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleToday}>
              {l.today}
            </Button>
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft size={18} />
            </Button>
            <span className="font-medium min-w-[150px] text-center capitalize">
              {format(currentDate, 'MMMM yyyy', { locale })}
            </span>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-card px-2 py-2 text-left font-medium border-b border-r min-w-[120px]">
                  <div className="flex items-center gap-1">
                    <Home size={14} />
                    Suítes
                  </div>
                </th>
                {daysInMonth.map((day) => (
                  <th
                    key={day.toISOString()}
                    className={`px-1 py-2 text-center font-medium border-b min-w-[32px] ${
                      isToday(day) ? 'bg-primary/20' : ''
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase">
                        {format(day, 'EEE', { locale }).slice(0, 3)}
                      </span>
                      <span className={isToday(day) ? 'text-primary font-bold' : ''}>
                        {format(day, 'd')}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suites.map((suite) => (
                <tr key={suite.id} className="hover:bg-muted/30">
                  <td className="sticky left-0 z-10 bg-card px-2 py-2 font-medium border-r border-b">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: suite.cor_identificacao || '#888' }}
                      />
                      <span className="truncate">{suite.nome}</span>
                    </div>
                  </td>
                  {daysInMonth.map((day) => {
                    const reserva = getReservationForDaySuite(day, suite.id);
                    const hasReserva = !!reserva;
                    
                    return (
                      <td
                        key={day.toISOString()}
                        className={`border-b p-0.5 ${isToday(day) ? 'bg-primary/10' : ''}`}
                      >
                        {hasReserva ? (
                          <HoverCard openDelay={100} closeDelay={50}>
                            <HoverCardTrigger asChild>
                              <button
                                onClick={() => handleCellClick(reserva)}
                                className={`w-full h-7 rounded-sm cursor-pointer transition-all hover:opacity-80 ${getStatusColor(reserva.status)} ${
                                  isCheckInDay(day, reserva) ? 'rounded-l-md' : ''
                                } ${isCheckOutDay(day, reserva) ? 'rounded-r-md' : ''}`}
                                title={reserva.hospede?.nome}
                              />
                            </HoverCardTrigger>
                            <HoverCardContent className="w-72" side="top">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <User size={16} className="text-primary" />
                                  <span className="font-semibold">{reserva.hospede?.nome}</span>
                                </div>
                                <div className="text-sm space-y-1 text-muted-foreground">
                                  <div className="flex justify-between">
                                    <span>{l.checkIn}:</span>
                                    <span className="font-medium text-foreground">
                                      {format(parseISO(reserva.data_checkin), 'dd/MM/yyyy')}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>{l.checkOut}:</span>
                                    <span className="font-medium text-foreground">
                                      {format(parseISO(reserva.data_checkout), 'dd/MM/yyyy')}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>{l.status}:</span>
                                    <span className={`font-medium ${
                                      reserva.status === 'confirmada' || reserva.status === 'em_andamento' 
                                        ? 'text-success' 
                                        : reserva.status === 'pendente' 
                                        ? 'text-warning' 
                                        : 'text-foreground'
                                    }`}>
                                      {getStatusLabel(reserva.status)}
                                    </span>
                                  </div>
                                  {reserva.valor_total && (
                                    <div className="flex justify-between">
                                      <span>{l.value}:</span>
                                      <span className="font-medium text-foreground">
                                        {formatCurrency(reserva.valor_total)}
                                      </span>
                                    </div>
                                  )}
                                  {reserva.numero_hospedes && (
                                    <div className="flex justify-between">
                                      <span>{language === 'pt' ? 'Hóspedes' : 'Ospiti'}:</span>
                                      <span className="font-medium text-foreground">
                                        {reserva.numero_hospedes} {l.guests}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <p className="text-xs text-primary pt-1">{l.clickToOpen}</p>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        ) : (
                          <div className="w-full h-7 rounded-sm bg-muted/30" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success" />
            <span>{language === 'pt' ? 'Em Andamento' : 'In Corso'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary/80" />
            <span>{language === 'pt' ? 'Confirmada' : 'Confermata'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-warning" />
            <span>{language === 'pt' ? 'Pendente' : 'In Attesa'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted-foreground/50" />
            <span>{language === 'pt' ? 'Finalizada' : 'Completata'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted/30 border" />
            <span>{l.noReservation}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
