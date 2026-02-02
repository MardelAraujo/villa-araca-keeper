import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, GripVertical } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, parseISO, addMonths, subMonths } from 'date-fns';
import { ptBR, it } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedReserva, setDraggedReserva] = useState<Reserva | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{ day: Date; suiteId: string } | null>(null);

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
      dayUse: 'Day-Use',
      movedSuccess: 'Reserva movida com sucesso!',
      movedError: 'Erro ao mover reserva',
      dragHint: 'Arraste para mover',
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
      dayUse: 'Day-Use',
      movedSuccess: 'Prenotazione spostata con successo!',
      movedError: 'Errore nello spostare la prenotazione',
      dragHint: 'Trascina per spostare',
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

  // Mutation to move a reservation to a different suite
  const moveReservaMutation = useMutation({
    mutationFn: async ({ reservaId, newSuiteId }: { reservaId: string; newSuiteId: string }) => {
      const { error } = await supabase
        .from('reservas')
        .update({ suite_id: newSuiteId })
        .eq('id', reservaId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservas-planner'] });
      toast({
        title: l.movedSuccess,
      });
    },
    onError: () => {
      toast({
        title: l.movedError,
        variant: 'destructive',
      });
    },
  });

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [currentDate]);

  // Add Day-Use as a virtual suite
  const suitesWithDayUse = useMemo(() => {
    const dayUseSuite: Suite = {
      id: 'day-use',
      nome: l.dayUse,
      cor_identificacao: '#FF69B4', // Hot pink for Day-Use
      status: 'ativo',
    };
    return [...suites, dayUseSuite];
  }, [suites, l.dayUse]);

  const getReservationForDaySuite = (day: Date, suiteId: string): Reserva | null => {
    // Day-use column shows same-day reservations
    if (suiteId === 'day-use') {
      return reservas.find((reserva) => {
        const checkin = parseISO(reserva.data_checkin);
        const checkout = parseISO(reserva.data_checkout);
        return isSameDay(checkin, checkout) && isSameDay(day, checkin);
      }) || null;
    }

    return reservas.find((reserva) => {
      if (reserva.suite_id !== suiteId) return false;
      const checkin = parseISO(reserva.data_checkin);
      const checkout = parseISO(reserva.data_checkout);
      // Don't show same-day reservations in regular suite columns
      if (isSameDay(checkin, checkout)) return false;
      return isWithinInterval(day, { start: checkin, end: checkout }) || 
             isSameDay(day, checkin) || 
             isSameDay(day, checkout);
    }) || null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada':
        return 'bg-green-500';
      case 'em_andamento':
        return 'bg-green-600';
      case 'pendente':
        return 'bg-yellow-400';
      case 'finalizada':
        return 'bg-gray-300';
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

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, reserva: Reserva) => {
    setDraggedReserva(reserva);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', reserva.id);
  };

  const handleDragOver = (e: React.DragEvent, day: Date, suiteId: string) => {
    e.preventDefault();
    if (suiteId !== 'day-use') {
      setDragOverCell({ day, suiteId });
    }
  };

  const handleDragLeave = () => {
    setDragOverCell(null);
  };

  const handleDrop = (e: React.DragEvent, day: Date, suiteId: string) => {
    e.preventDefault();
    setDragOverCell(null);
    
    if (draggedReserva && suiteId !== 'day-use' && draggedReserva.suite_id !== suiteId) {
      moveReservaMutation.mutate({
        reservaId: draggedReserva.id,
        newSuiteId: suiteId,
      });
    }
    setDraggedReserva(null);
  };

  const handleDragEnd = () => {
    setDraggedReserva(null);
    setDragOverCell(null);
  };

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
                <th className="sticky left-0 z-10 bg-card px-3 py-2 text-left font-medium border-b border-r min-w-[100px]">
                  <div className="flex items-center gap-1">
                    <CalendarIcon size={14} />
                    {language === 'pt' ? 'Data' : 'Data'}
                  </div>
                </th>
                {suitesWithDayUse.map((suite) => (
                  <th
                    key={suite.id}
                    className="px-2 py-2 text-center font-medium border-b min-w-[100px]"
                    style={{
                      backgroundColor: suite.cor_identificacao ? `${suite.cor_identificacao}20` : undefined,
                    }}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: suite.cor_identificacao || '#888' }}
                      />
                      <span className="truncate max-w-[90px]">{suite.nome}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {daysInMonth.map((day) => (
                <tr key={day.toISOString()} className="hover:bg-muted/30">
                  <td
                    className={`sticky left-0 z-10 bg-card px-3 py-1 font-medium border-r border-b ${
                      isToday(day) ? 'bg-primary/20' : ''
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className={`text-sm ${isToday(day) ? 'text-primary font-bold' : ''}`}>
                        {format(day, 'MMM dd', { locale })}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase">
                        {format(day, 'EEE', { locale })}
                      </span>
                    </div>
                  </td>
                  {suitesWithDayUse.map((suite) => {
                    const reserva = getReservationForDaySuite(day, suite.id);
                    const hasReserva = !!reserva;
                    const isDragOver = dragOverCell?.day === day && dragOverCell?.suiteId === suite.id;
                    
                    return (
                      <td
                        key={suite.id}
                        className={`border-b p-0.5 transition-colors ${
                          isToday(day) ? 'bg-primary/5' : ''
                        } ${isDragOver ? 'bg-primary/20 ring-2 ring-primary ring-inset' : ''}`}
                        onDragOver={(e) => handleDragOver(e, day, suite.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, day, suite.id)}
                      >
                        {hasReserva ? (
                          <HoverCard openDelay={100} closeDelay={50}>
                            <HoverCardTrigger asChild>
                              <button
                                draggable={suite.id !== 'day-use'}
                                onDragStart={(e) => handleDragStart(e, reserva)}
                                onDragEnd={handleDragEnd}
                                onClick={() => handleCellClick(reserva)}
                                className={`w-full h-8 rounded cursor-pointer transition-all hover:opacity-80 flex items-center justify-center gap-1 text-[10px] font-medium text-foreground ${getStatusColor(reserva.status)} ${
                                  draggedReserva?.id === reserva.id ? 'opacity-50' : ''
                                }`}
                                title={reserva.hospede?.nome}
                              >
                                {suite.id !== 'day-use' && <GripVertical size={10} className="opacity-50" />}
                                <span className="truncate max-w-[80px]">
                                  {reserva.hospede?.nome?.split(' ')[0]}
                                </span>
                              </button>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-72" side="right">
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
                                        ? 'text-green-600' 
                                        : reserva.status === 'pendente' 
                                        ? 'text-yellow-600' 
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
                                <div className="flex justify-between items-center pt-1 border-t">
                                  <p className="text-xs text-primary">{l.clickToOpen}</p>
                                  {suite.id !== 'day-use' && (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                      <GripVertical size={10} />
                                      {l.dragHint}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        ) : (
                          <div 
                            className={`w-full h-8 rounded transition-colors ${
                              suite.cor_identificacao ? 'bg-opacity-10' : 'bg-muted/20'
                            }`}
                            style={{
                              backgroundColor: suite.cor_identificacao ? `${suite.cor_identificacao}10` : undefined,
                            }}
                          />
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
            <div className="w-4 h-4 rounded bg-green-600" />
            <span>{language === 'pt' ? 'Em Andamento' : 'In Corso'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span>{language === 'pt' ? 'Confirmada' : 'Confermata'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-400" />
            <span>{language === 'pt' ? 'Pendente' : 'In Attesa'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-300" />
            <span>{language === 'pt' ? 'Finalizada' : 'Completata'}</span>
          </div>
          <div className="flex items-center gap-2 ml-auto text-muted-foreground">
            <GripVertical size={14} />
            <span>{l.dragHint}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
