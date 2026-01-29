import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const guestFormSchema = z.object({
  nome: z.string().trim().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }).max(100, { message: 'Nome deve ter no máximo 100 caracteres' }),
  cpf: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email({ message: 'Email inválido' }).optional().or(z.literal('')),
  endereco: z.string().max(200, { message: 'Endereço deve ter no máximo 200 caracteres' }).optional(),
  cidade: z.string().max(100, { message: 'Cidade deve ter no máximo 100 caracteres' }).optional(),
  estado: z.string().max(50, { message: 'Estado deve ter no máximo 50 caracteres' }).optional(),
  pais: z.string().max(50, { message: 'País deve ter no máximo 50 caracteres' }).optional(),
  observacoes: z.string().max(500, { message: 'Observações devem ter no máximo 500 caracteres' }).optional(),
});

type GuestFormData = z.infer<typeof guestFormSchema>;

interface UploadedDocument {
  id?: string;
  tipo_documento: string;
  numero_documento?: string;
  arquivo_url: string;
  file_name: string;
}

const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const NovoHospede = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);

  // Document types for guests (ID documents only, NOT linked to reservations)
  const guestDocumentTypes = language === 'pt'
    ? [
        { value: 'rg', label: 'RG' },
        { value: 'cpf', label: 'CPF' },
        { value: 'cnh', label: 'CNH' },
        { value: 'passaporte', label: 'Passaporte' },
        { value: 'comprovante_residencia', label: 'Comprovante de Residência' },
        { value: 'certidao_nascimento', label: 'Certidão de Nascimento' },
        { value: 'outros_identificacao', label: 'Outros Documentos de Identificação' },
      ]
    : [
        { value: 'rg', label: 'Carta d\'Identità' },
        { value: 'cpf', label: 'Codice Fiscale' },
        { value: 'cnh', label: 'Patente' },
        { value: 'passaporte', label: 'Passaporto' },
        { value: 'comprovante_residencia', label: 'Prova di Residenza' },
        { value: 'certidao_nascimento', label: 'Certificato di Nascita' },
        { value: 'outros_identificacao', label: 'Altri Documenti di Identificazione' },
      ];

  const form = useForm<GuestFormData>({
    resolver: zodResolver(guestFormSchema),
    defaultValues: {
      nome: '',
      cpf: '',
      telefone: '',
      email: '',
      endereco: '',
      cidade: '',
      estado: '',
      pais: 'Brasil',
      observacoes: '',
    },
  });

  const onSubmit = async (data: GuestFormData) => {
    setIsSubmitting(true);
    try {
      // Create guest
      const { data: hospedeData, error: hospedeError } = await supabase
        .from('hospedes')
        .insert({
          nome: data.nome,
          cpf: data.cpf || null,
          telefone: data.telefone || null,
          email: data.email || null,
          endereco: data.endereco || null,
          cidade: data.cidade || null,
          estado: data.estado || null,
          pais: data.pais || 'Brasil',
          observacoes: data.observacoes || null,
        })
        .select()
        .single();

      if (hospedeError) throw hospedeError;

      // Create documents linked to guest ONLY (no reserva_id)
      if (documents.length > 0) {
        const documentInserts = documents.map((doc) => ({
          hospede_id: hospedeData.id,
          reserva_id: null, // Guest documents are NOT linked to reservations
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
        title: language === 'pt' ? 'Hóspede cadastrado!' : 'Ospite registrato!',
        description: language === 'pt' 
          ? 'O hóspede foi cadastrado com sucesso.' 
          : "L'ospite è stato registrato con successo.",
      });

      navigate('/hospedes');
    } catch (error) {
      console.error('Error creating guest:', error);
      toast({
        title: language === 'pt' ? 'Erro ao cadastrar' : 'Errore durante la registrazione',
        description: language === 'pt' 
          ? 'Ocorreu um erro ao cadastrar o hóspede. Tente novamente.' 
          : "Si è verificato un errore durante la registrazione dell'ospite. Riprova.",
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const labels = {
    pt: {
      title: 'Novo Hóspede',
      subtitle: 'Cadastre um novo hóspede no sistema',
      personalData: 'Dados Pessoais',
      name: 'Nome Completo',
      namePlaceholder: 'Digite o nome completo',
      cpf: 'CPF / Documento',
      cpfPlaceholder: 'Digite o CPF ou documento',
      phone: 'Telefone',
      phonePlaceholder: '+55 (00) 00000-0000',
      email: 'E-mail',
      emailPlaceholder: 'email@exemplo.com',
      address: 'Endereço',
      addressData: 'Dados de Endereço',
      addressPlaceholder: 'Rua, número, complemento',
      city: 'Cidade',
      cityPlaceholder: 'Digite a cidade',
      state: 'Estado',
      statePlaceholder: 'Selecione o estado',
      country: 'País',
      countryPlaceholder: 'Digite o país',
      notes: 'Observações Internas',
      notesPlaceholder: 'Preferências, restrições alimentares, datas especiais...',
      documents: 'Documentos de Identificação',
      documentsDesc: 'RG, CPF, passaporte, comprovante de residência (vinculados ao hóspede)',
      back: 'Voltar',
      save: 'Salvar Hóspede',
      saving: 'Salvando...',
    },
    it: {
      title: 'Nuovo Ospite',
      subtitle: 'Registra un nuovo ospite nel sistema',
      personalData: 'Dati Personali',
      name: 'Nome Completo',
      namePlaceholder: 'Inserisci il nome completo',
      cpf: 'Documento',
      cpfPlaceholder: 'Inserisci il documento',
      phone: 'Telefono',
      phonePlaceholder: '+39 000 0000000',
      email: 'E-mail',
      emailPlaceholder: 'email@esempio.com',
      address: 'Indirizzo',
      addressData: 'Dati Indirizzo',
      addressPlaceholder: 'Via, numero, interno',
      city: 'Città',
      cityPlaceholder: 'Inserisci la città',
      state: 'Stato/Regione',
      statePlaceholder: 'Seleziona lo stato',
      country: 'Paese',
      countryPlaceholder: 'Inserisci il paese',
      notes: 'Note Interne',
      notesPlaceholder: 'Preferenze, restrizioni alimentari, date speciali...',
      documents: 'Documenti di Identificazione',
      documentsDesc: 'Carta d\'identità, passaporto, prova di residenza (collegati all\'ospite)',
      back: 'Indietro',
      save: 'Salva Ospite',
      saving: 'Salvataggio...',
    },
  };

  const l = labels[language];

  return (
    <MainLayout title={l.title} subtitle={l.subtitle}>
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/hospedes')}
          className="mb-6"
        >
          <ArrowLeft size={18} className="mr-2" />
          {l.back}
        </Button>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Data Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{l.personalData}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{l.name} *</FormLabel>
                      <FormControl>
                        <Input placeholder={l.namePlaceholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{l.cpf}</FormLabel>
                        <FormControl>
                          <Input placeholder={l.cpfPlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{l.phone}</FormLabel>
                        <FormControl>
                          <Input placeholder={l.phonePlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{l.email}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder={l.emailPlaceholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Address Data Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{l.addressData}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="endereco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{l.address}</FormLabel>
                      <FormControl>
                        <Input placeholder={l.addressPlaceholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{l.city}</FormLabel>
                        <FormControl>
                          <Input placeholder={l.cityPlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{l.state}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={l.statePlaceholder} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brazilianStates.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="pais"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{l.country}</FormLabel>
                      <FormControl>
                        <Input placeholder={l.countryPlaceholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Documents Card - Guest ID Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{l.documents}</CardTitle>
                <p className="text-sm text-muted-foreground">{l.documentsDesc}</p>
              </CardHeader>
              <CardContent>
                <DocumentUpload
                  documents={documents}
                  onDocumentsChange={setDocuments}
                  documentTypes={guestDocumentTypes}
                  folder="hospedes"
                />
              </CardContent>
            </Card>

            {/* Notes Card */}
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
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
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
      </div>
    </MainLayout>
  );
};

export default NovoHospede;
