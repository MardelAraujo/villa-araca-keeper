import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { mockHospedes } from '@/data/mock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Plus, Mail, Phone, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Hospedes = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHospedes = mockHospedes.filter(
    (hospede) =>
      hospede.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospede.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospede.telefone.includes(searchTerm)
  );

  const formatCurrency = (value?: number) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <MainLayout
      title="Hóspedes"
      subtitle={`${filteredHospedes.length} hóspedes cadastrados`}
    >
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Buscar por nome, email ou telefone..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Link to="/hospedes/novo">
          <Button>
            <Plus size={18} className="mr-2" />
            Novo Hóspede
          </Button>
        </Link>
      </div>

      {/* Hóspedes Grid */}
      {filteredHospedes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHospedes.map((hospede) => (
            <Link key={hospede.id} to={`/hospedes/${hospede.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-lg">
                      {hospede.nome_completo
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-card-foreground truncate">
                        {hospede.nome_completo}
                      </h3>
                      {hospede.nacionalidade && (
                        <p className="text-sm text-muted-foreground">
                          {hospede.nacionalidade}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail size={14} />
                      <span className="truncate">{hospede.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone size={14} />
                      <span>{hospede.telefone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar size={14} />
                      <span>
                        Desde{' '}
                        {format(new Date(hospede.data_criacao), 'MMM yyyy', {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <User size={14} />
                      <span>
                        {hospede.total_reservas || 0}{' '}
                        {hospede.total_reservas === 1 ? 'reserva' : 'reservas'}
                      </span>
                    </div>
                    <div className="font-medium text-card-foreground">
                      {formatCurrency(hospede.total_gasto)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhum hóspede encontrado com os filtros aplicados.
          </p>
        </div>
      )}
    </MainLayout>
  );
};

export default Hospedes;
