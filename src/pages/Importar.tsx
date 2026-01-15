import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const Importar = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  return (
    <MainLayout
      title="Importar Reservas"
      subtitle="Importe reservas do Booking automaticamente"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Dropzone */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload size={20} className="text-primary" />
              Arrastar e Soltar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-12 text-center transition-colors',
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50',
                uploadedFile && 'border-[hsl(var(--success))] bg-[hsl(var(--success))]/5'
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {uploadedFile ? (
                <div className="space-y-3">
                  <CheckCircle
                    size={48}
                    className="mx-auto text-[hsl(var(--success))]"
                  />
                  <p className="font-medium text-card-foreground">
                    Arquivo carregado
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {uploadedFile.name}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setUploadedFile(null)}
                  >
                    Remover
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <FileText
                    size={48}
                    className="mx-auto text-muted-foreground"
                  />
                  <p className="font-medium text-card-foreground">
                    Arraste o PDF ou e-mail do Booking aqui
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ou clique para selecionar um arquivo
                  </p>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.eml,.msg"
                    onChange={handleFileSelect}
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      document.getElementById('file-upload')?.click()
                    }
                  >
                    Selecionar Arquivo
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Process Button */}
        {uploadedFile && (
          <Button className="w-full" size="lg">
            Processar Reserva
          </Button>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Como funciona</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  1
                </span>
                <span>
                  Arraste o PDF de confirmação ou o e-mail do Booking para a
                  área acima
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  2
                </span>
                <span>
                  O sistema irá extrair automaticamente: nome, e-mail, telefone,
                  datas e valor
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  3
                </span>
                <span>
                  Se o hóspede já existir, a reserva será vinculada
                  automaticamente
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  4
                </span>
                <span>Revise os dados e confirme a importação</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Warning */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-[hsl(var(--warning))]/10 border border-[hsl(var(--warning))]/30">
          <AlertCircle
            size={20}
            className="flex-shrink-0 text-[hsl(var(--warning))]"
          />
          <p className="text-sm text-muted-foreground">
            <strong>Dica:</strong> Certifique-se de que o PDF ou e-mail contém
            todas as informações da reserva. Arquivos parciais podem resultar em
            dados incompletos.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Importar;
