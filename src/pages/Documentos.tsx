import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Plus,
  FileText,
  Download,
  Trash2,
  Upload,
  Receipt,
  UtensilsCrossed,
  Wine,
  FileSignature,
  File,
} from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { DocumentoLancamento, TipoDocumento } from '@/types';
import { mockDocumentos, mockReservas } from '@/data/mock';

const tipoIcons: Record<TipoDocumento, React.ReactNode> = {
  comprovante_pagamento: <Receipt className="h-4 w-4" />,
  consumo_restaurante: <UtensilsCrossed className="h-4 w-4" />,
  consumo_frigobar: <Wine className="h-4 w-4" />,
  contrato_assinado: <FileSignature className="h-4 w-4" />,
  outros: <File className="h-4 w-4" />,
};

const tipoColors: Record<TipoDocumento, string> = {
  comprovante_pagamento: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  consumo_restaurante: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  consumo_frigobar: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  contrato_assinado: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  outros: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

export default function Documentos() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredDocumentos = mockDocumentos.filter((doc) => {
    const matchesSearch =
      doc.descricao.toLowerCase().includes(search.toLowerCase()) ||
      doc.id_reserva.toLowerCase().includes(search.toLowerCase());
    const matchesTipo = tipoFilter === 'all' || doc.tipo_documento === tipoFilter;
    return matchesSearch && matchesTipo;
  });

  const getTipoLabel = (tipo: TipoDocumento) => {
    const labels: Record<TipoDocumento, string> = {
      comprovante_pagamento: t('documents.paymentProof'),
      consumo_restaurante: t('documents.restaurantConsumption'),
      consumo_frigobar: t('documents.minibarConsumption'),
      contrato_assinado: t('documents.signedContract'),
      outros: t('documents.others'),
    };
    return labels[tipo];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getReservaInfo = (idReserva: string) => {
    const reserva = mockReservas.find((r) => r.id === idReserva);
    return reserva?.hospede?.nome_completo || idReserva;
  };

  return (
    <MainLayout
      title={t('documents.title')}
      subtitle={t('documents.subtitle')}
    >
      <div className="space-y-6">
        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder={t('documents.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder={t('documents.filter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('documents.all')}</SelectItem>
                <SelectItem value="comprovante_pagamento">
                  {t('documents.paymentProof')}
                </SelectItem>
                <SelectItem value="consumo_restaurante">
                  {t('documents.restaurantConsumption')}
                </SelectItem>
                <SelectItem value="consumo_frigobar">
                  {t('documents.minibarConsumption')}
                </SelectItem>
                <SelectItem value="contrato_assinado">
                  {t('documents.signedContract')}
                </SelectItem>
                <SelectItem value="outros">{t('documents.others')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={18} />
                {t('documents.newDocument')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('documents.newDocument')}</DialogTitle>
                <DialogDescription>
                  Adicione um novo documento ou lançamento
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Reserva</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a reserva" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockReservas.map((reserva) => (
                        <SelectItem key={reserva.id} value={reserva.id}>
                          {reserva.hospede?.nome_completo} - #{reserva.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Documento</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprovante_pagamento">
                        {t('documents.paymentProof')}
                      </SelectItem>
                      <SelectItem value="consumo_restaurante">
                        {t('documents.restaurantConsumption')}
                      </SelectItem>
                      <SelectItem value="consumo_frigobar">
                        {t('documents.minibarConsumption')}
                      </SelectItem>
                      <SelectItem value="contrato_assinado">
                        {t('documents.signedContract')}
                      </SelectItem>
                      <SelectItem value="outros">{t('documents.others')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea placeholder="Descreva o documento..." />
                </div>
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input type="number" placeholder="0,00" />
                </div>
                <div className="space-y-2">
                  <Label>Arquivo</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-accent/50 transition-colors">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Clique para fazer upload ou arraste o arquivo
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)}>
                    {t('common.save')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('documents.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDocumentos.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('documents.noResults')}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>{t('documents.reservation')}</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocumentos.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`gap-1 ${tipoColors[doc.tipo_documento]}`}
                        >
                          {tipoIcons[doc.tipo_documento]}
                          {getTipoLabel(doc.tipo_documento)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {doc.descricao}
                      </TableCell>
                      <TableCell>{getReservaInfo(doc.id_reserva)}</TableCell>
                      <TableCell>{formatCurrency(doc.valor)}</TableCell>
                      <TableCell>
                        {format(new Date(doc.data_registro), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {doc.arquivo_url && (
                            <Button variant="ghost" size="icon">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Receipt className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pagamentos</p>
                  <p className="text-2xl font-bold">
                    {
                      mockDocumentos.filter(
                        (d) => d.tipo_documento === 'comprovante_pagamento'
                      ).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <UtensilsCrossed className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Restaurante</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      mockDocumentos
                        .filter((d) => d.tipo_documento === 'consumo_restaurante')
                        .reduce((acc, d) => acc + d.valor, 0)
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Wine className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Frigobar</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      mockDocumentos
                        .filter((d) => d.tipo_documento === 'consumo_frigobar')
                        .reduce((acc, d) => acc + d.valor, 0)
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FileSignature className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contratos</p>
                  <p className="text-2xl font-bold">
                    {
                      mockDocumentos.filter(
                        (d) => d.tipo_documento === 'contrato_assinado'
                      ).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
