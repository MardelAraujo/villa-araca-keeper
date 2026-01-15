import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ReservaCard } from '@/components/reservas/ReservaCard';
import { mockReservas } from '@/data/mock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, Filter, Grid3X3, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const Reservas = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todas');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredReservas = mockReservas.filter((reserva) => {
    const matchesSearch =
      reserva.hospede?.nome_completo
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      reserva.codigo_reserva_externa
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'todas' || reserva.status_reserva === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'todas', label: t('reservations.all') },
    { value: 'solicitacao', label: t('reservations.request') },
    { value: 'confirmada', label: t('reservations.confirmed') },
    { value: 'em_andamento', label: t('reservations.inProgress') },
    { value: 'finalizada', label: t('reservations.finished') },
    { value: 'cancelada', label: t('reservations.canceled') },
  ];

  return (
    <MainLayout
      title={t('reservations.title')}
      subtitle={t('reservations.subtitle')}
    >
      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder={t('reservations.search')}
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter size={16} className="mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex border border-border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className={cn(viewMode === 'grid' && 'bg-muted')}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(viewMode === 'list' && 'bg-muted')}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
            </Button>
          </div>

          <Link to="/reservas/nova">
            <Button>
              <Plus size={18} className="mr-2" />
              {t('reservations.newReservation')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Reservas Grid/List */}
      {filteredReservas.length > 0 ? (
        <div
          className={cn(
            'grid gap-4',
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          )}
        >
          {filteredReservas.map((reserva) => (
            <ReservaCard key={reserva.id} reserva={reserva} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {t('reservations.noResults')}
          </p>
        </div>
      )}
    </MainLayout>
  );
};

export default Reservas;
