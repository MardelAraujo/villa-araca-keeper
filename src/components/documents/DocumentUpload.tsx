import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface UploadedDocument {
  id?: string;
  tipo_documento: string;
  numero_documento?: string;
  arquivo_url: string;
  file_name: string;
}

interface DocumentUploadProps {
  documents: UploadedDocument[];
  onDocumentsChange: (documents: UploadedDocument[]) => void;
  documentTypes: { value: string; label: string }[];
  folder: string; // 'hospedes' or 'reservas'
}

export const DocumentUpload = ({
  documents,
  onDocumentsChange,
  documentTypes,
  folder,
}: DocumentUploadProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingType, setPendingType] = useState('');
  const [pendingNumber, setPendingNumber] = useState('');

  const labels = {
    pt: {
      addDocument: 'Adicionar Documento',
      selectType: 'Selecione o tipo',
      documentNumber: 'Número do documento',
      numberPlaceholder: 'Ex: 123.456.789-00',
      selectFile: 'Selecionar arquivo',
      upload: 'Enviar',
      uploading: 'Enviando...',
      cancel: 'Cancelar',
      noDocuments: 'Nenhum documento anexado',
      uploadSuccess: 'Documento enviado com sucesso',
      uploadError: 'Erro ao enviar documento',
      removeError: 'Erro ao remover documento',
    },
    it: {
      addDocument: 'Aggiungi Documento',
      selectType: 'Seleziona il tipo',
      documentNumber: 'Numero del documento',
      numberPlaceholder: 'Es: AA1234567',
      selectFile: 'Seleziona file',
      upload: 'Carica',
      uploading: 'Caricamento...',
      cancel: 'Annulla',
      noDocuments: 'Nessun documento allegato',
      uploadSuccess: 'Documento caricato con successo',
      uploadError: 'Errore durante il caricamento',
      removeError: 'Errore durante la rimozione',
    },
  };

  const l = labels[language];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingFile(file);
    }
  };

  const handleUpload = async () => {
    if (!pendingFile || !pendingType) return;

    setIsUploading(true);
    try {
      const fileExt = pendingFile.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(fileName, pendingFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('documentos')
        .getPublicUrl(fileName);

      const newDoc: UploadedDocument = {
        tipo_documento: pendingType,
        numero_documento: pendingNumber || undefined,
        arquivo_url: urlData.publicUrl,
        file_name: pendingFile.name,
      };

      onDocumentsChange([...documents, newDoc]);

      toast({
        title: l.uploadSuccess,
      });

      // Reset form
      setPendingFile(null);
      setPendingType('');
      setPendingNumber('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: l.uploadError,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    const newDocs = documents.filter((_, i) => i !== index);
    onDocumentsChange(newDocs);
  };

  const getDocumentTypeLabel = (value: string) => {
    return documentTypes.find((t) => t.value === value)?.label || value;
  };

  return (
    <div className="space-y-4">
      {/* Upload Form */}
      <Card className="border-dashed">
        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{l.selectType} *</Label>
              <Select value={pendingType} onValueChange={setPendingType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={l.selectType} />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{l.documentNumber}</Label>
              <Input
                className="mt-1"
                placeholder={l.numberPlaceholder}
                value={pendingNumber}
                onChange={(e) => setPendingNumber(e.target.value)}
              />
            </div>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} className="mr-2" />
                {l.selectFile}
              </Button>
              {pendingFile && (
                <span className="text-sm text-muted-foreground">
                  {pendingFile.name}
                </span>
              )}
            </div>
          </div>

          {pendingFile && pendingType && (
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    {l.uploading}
                  </>
                ) : (
                  l.upload
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setPendingFile(null);
                  setPendingType('');
                  setPendingNumber('');
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                {l.cancel}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document List */}
      {documents.length > 0 ? (
        <div className="space-y-2">
          {documents.map((doc, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {getDocumentTypeLabel(doc.tipo_documento)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {doc.numero_documento && `${doc.numero_documento} • `}
                    {doc.file_name}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(index)}
              >
                <X size={16} />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          {l.noDocuments}
        </p>
      )}
    </div>
  );
};
