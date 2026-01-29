import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSuites } from '@/hooks/useSuites';
import { useHospedes } from '@/hooks/useHospedes';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { ArrowLeft, Save, Loader2, CalendarIcon, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { ptBR, it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Link } from 'react-router-dom';

const reservationFormSchema = z.object({
  hospede_id: z.string().min(1, { message: 'Selecione um hóspede' }),
  suite_id: z.string().min(1, { message: 'Selecione uma suíte' }),
  data_checkin: z.date({ required_error: 'Data de check-in é obrigatória' }),
  data_checkout: z.date({ required_error: 'Data de check-out é obrigatória' }),
  numero_hospedes: z.number().min(1).max(10).default(1),
  valor_total: z.number().min(0).default(0),
  valor_pago: z.number().min(0).default(0),
  status: z.string().default('pendente'),
  observacoes: z.string().max(500).optional(),
}).refine((data) => data.data_checkout > data.data_checkin, {
  message: 'Check-out deve ser após check-in',
  path: ['data_checkout'],
});

type ReservationFormData = z.infer<typeof reservationFormSchema>;

interface UploadedDocument {
  id?: string;
  tipo_documento: string;
  numero_documento?: string;
  arquivo_url: string;
  file_name: string;
}

const NovaReserva = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);

  const { data: suites, isLoading: suitesLoading } = useSuites();
  const { data: hospedes, isLoading: hospedesLoading } = useHospedes();

  const preSelectedHospedeId = searchParams.get('hospede_id');

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationFormSchema),
    defaultValues: {
      hospede_id: preSelectedHospedeId || '',
      suite_id: '',
      numero_hospedes: 1,
      valor_total: 0,
      valor_pago: 0,
      status: 'pendente',
      observacoes: '',
    },
  });

  useEffect(() => {
    if (preSelectedHospedeId) {
      form.setValue('hospede_id', preSelectedHospedeId);
    }
  }, [preSelectedHospedeId, form]);

  const dateLocale = language === 'it' ? it : ptBR;

  // Document types for reservations (consumptions, receipts, etc.)
  const reservationDocumentTypes = language === 'pt'
    ? [
        { value: 'comprovante_pagamento', label: 'Comprovante de Pagamento' },
        { value: 'consumo_restaurante', label: 'Consumo Restaurante' },
        { value: 'consumo_frigobar', label: 'Consumo Frigobar' },
        { value: 'contrato_assinado', label: 'Contrato Assinado' },
        { value: 'nota_fiscal', label: 'Nota Fiscal' },
        { value: 'outros', label: 'Outros' },
      ]
    : [
        { value: 'comprovante_pagamento', label: 'Ricevuta di Pagamento' },
        { value: 'consumo_restaurante', label: 'Consumo Ristorante' },
        { value: 'consumo_frigobar', label: 'Consumo Minibar' },
        { value: 'contrato_assinado', label: 'Contratto Firmato' },
        { value: 'nota_fiscal', label: 'Fattura' },
        { value: 'outros', label: 'Altri' },
      ];

  const statusOptions = language === 'pt'
    ? [
        { value: 'pendente', label: 'Pendente' },
        { value: 'confirmada', label: 'Confirmada' },
        { value: 'em_andamento', label: 'Em Andamento' },
        { value: 'finalizada', label: 'Finalizada' },
        { value: 'cancelada', label: 'Cancelada' },
      ]
    : [
        { value: 'pendente', label: 'In Attesa' },
        { value: 'confirmada', label: 'Confermata' },
        { value: 'em_andamento', label: 'In Corso' },
        { value: 'finalizada', label: 'Completata' },
        { value: 'cancelada', label: 'Cancellata' },
      ];

  const onSubmit = async (data: ReservationFormData) => {
    setIsSubmitting(true);
    try {
      // Create reservation
      const { data: reservaData, error: reservaError } = await supabase
        .from('reservas')
        .insert({
          hospede_id: data.hospede_id,
          suite_id: data.suite_id,
          data_checkin: format(data.data_checkin, 'yyyy-MM-dd'),
          data_checkout: format(data.data_checkout, 'yyyy-MM-dd'),
          numero_hospedes: data.numero_hospedes,
          valor_total: data.valor_total,
          valor_pago: data.valor_pago,
          status: data.status,
          observacoes: data.observacoes || null,
        })
        .select()
        .single();

      if (reservaError) throw reservaError;

      // Create documents linked to reservation
      if (documents.length > 0) {
        const documentInserts = documents.map((doc) => ({
          hospede_id: data.hospede_id,
          reserva_id: reservaData.id,
          tipo_documento: doc.tipo_documento,
          numero_documento: doc.numero_documento || null,
          arquivo_url: doc.arquivo_url,
        }));

        const { error: docsError } = await supabase
          .from('documentos')
          .insert(documentInserts);

        if (docsError) {
          console.error('Error saving documents:', docsError);
        }
      }

      toast({
        title: language === 'pt' ? 'Reserva criada!' : 'Prenotazione creata!',
        description: language === 'pt'
          ? `Código: ${reservaData.codigo_booking}`
          : `Codice: ${reservaData.codigo_booking}`,
      });

      navigate('/reservas');
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast({
        title: language === 'pt' ? 'Erro ao criar reserva' : 'Errore durante la creazione',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const labels = {
    pt: {
      title: 'Nova Reserva',
      subtitle: 'Cadastre uma nova reserva',
      guestData: 'Dados do Hóspede',
      selectGuest: 'Selecione o hóspede',
      noGuests: 'Nenhum hóspede cadastrado',
      newGuest: 'Novo Hóspede',
      reservationData: 'Dados da Reserva',
      suite: 'Suíte',
      selectSuite: 'Selecione a suíte',
      checkin: 'Check-in',
      checkout: 'Check-out',
      selectDate: 'Selecione a data',
      guestCount: 'Nº de Hóspedes',
      status: 'Status',
      financialData: 'Dados Financeiros',
      totalValue: 'Valor Total (R$)',
      paidValue: 'Valor Pago (R$)',
      notes: 'Observações',
      notesPlaceholder: 'Observações sobre a reserva...',
      documents: 'Documentos da Reserva',
      documentsDesc: 'Comandas, comprovantes de pagamento, contratos, etc.',
      back: 'Voltar',
      save: 'Salvar Reserva',
      saving: 'Salvando...',
    },
    it: {
      title: 'Nuova Prenotazione',
      subtitle: 'Registra una nuova prenotazione',
      guestData: "Dati dell'Ospite",
      selectGuest: "Seleziona l'ospite",
      noGuests: 'Nessun ospite registrato',
      newGuest: 'Nuovo Ospite',
      reservationData: 'Dati della Prenotazione',
      suite: 'Suite',
      selectSuite: 'Seleziona la suite',
      checkin: 'Check-in',
      checkout: 'Check-out',
      selectDate: 'Seleziona la data',
      guestCount: 'N° di Ospiti',
      status: 'Stato',
      financialData: 'Dati Finanziari',
      totalValue: 'Valore Totale (€)',
      paidValue: 'Valore Pagato (€)',
      notes: 'Note',
      notesPlaceholder: 'Note sulla prenotazione...',
      documents: 'Documenti della Prenotazione',
      documentsDesc: 'Conti, ricevute di pagamento, contratti, ecc.',
      back: 'Indietro',
      save: 'Salva Prenotazione',
      saving: 'Salvataggio...',
    },
  };

  const l = labels[language];

  const isLoading = suitesLoading || hospedesLoading;

  return (
    <MainLayout title={l.title} subtitle={l.subtitle}>
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/reservas')}
          className="mb-6"
        >
          <ArrowLeft size={18} className="mr-2" />
          {l.back}
        </Button>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Guest Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{l.guestData}</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="hospede_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{l.selectGuest} *</FormLabel>
                        <div className="flex gap-2">
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder={l.selectGuest} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {hospedes && hospedes.length > 0 ? (
                                hospedes.map((hospede) => (
                                  <SelectItem key={hospede.id} value={hospede.id}>
                                    {hospede.nome} {hospede.email && `(${hospede.email})`}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="none" disabled>
                                  {l.noGuests}
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <Link to="/hospedes/novo">
                            <Button type="button" variant="outline" size="icon">
                              <Plus size={18} />
                            </Button>
                          </Link>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Reservation Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{l.reservationData}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="suite_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{l.suite} *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={l.selectSuite} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {suites?.map((suite) => (
                              <SelectItem key={suite.id} value={suite.id}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: suite.cor_identificacao || '#ccc' }}
                                  />
                                  {suite.nome}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="data_checkin"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>{l.checkin} *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, 'PPP', { locale: dateLocale })
                                  ) : (
                                    <span>{l.selectDate}</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                locale={dateLocale}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="data_checkout"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>{l.checkout} *</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, 'PPP', { locale: dateLocale })
                                  ) : (
                                    <span>{l.selectDate}</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                locale={dateLocale}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="numero_hospedes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{l.guestCount}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={10}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{l.status}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {statusOptions.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Financial Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{l.financialData}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="valor_total"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{l.totalValue}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="valor_pago"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{l.paidValue}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{l.notes}</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="observacoes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder={l.notesPlaceholder}
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{l.documents}</CardTitle>
                  <p className="text-sm text-muted-foreground">{l.documentsDesc}</p>
                </CardHeader>
                <CardContent>
                  <DocumentUpload
                    documents={documents}
                    onDocumentsChange={setDocuments}
                    documentTypes={reservationDocumentTypes}
                    folder="reservas"
                  />
                </CardContent>
              </Card>

              {/* Submit */}
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting} size="lg">
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      {l.saving}
                    </>
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      {l.save}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </MainLayout>
  );
};

export default NovaReserva;
