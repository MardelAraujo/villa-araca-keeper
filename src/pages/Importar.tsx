import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const Importar = () => {
  const { t } = useLanguage();
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
      title={t('import.title')}
      subtitle={t('import.subtitle')}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Dropzone */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload size={20} className="text-primary" />
              {t('import.dropzone')}
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
                    {uploadedFile.name}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setUploadedFile(null)}
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <FileText
                    size={48}
                    className="mx-auto text-muted-foreground"
                  />
                  <p className="font-medium text-card-foreground">
                    {t('import.dropzone')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('import.formats')}
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
                    {t('common.view')}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Process Button */}
        {uploadedFile && (
          <Button className="w-full" size="lg">
            {t('common.save')}
          </Button>
        )}

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('import.history')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              {t('import.noHistory')}
            </p>
          </CardContent>
        </Card>

        {/* Warning */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-[hsl(var(--warning))]/10 border border-[hsl(var(--warning))]/30">
          <AlertCircle
            size={20}
            className="flex-shrink-0 text-[hsl(var(--warning))]"
          />
          <p className="text-sm text-muted-foreground">
            <strong>Dica:</strong> {t('import.formats')}
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Importar;
