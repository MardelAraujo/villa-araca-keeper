-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for document uploads
CREATE POLICY "Allow public read access to documentos"
ON storage.objects FOR SELECT
USING (bucket_id = 'documentos');

CREATE POLICY "Allow uploads to documentos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documentos');

CREATE POLICY "Allow updates to documentos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'documentos');

CREATE POLICY "Allow deletes from documentos"
ON storage.objects FOR DELETE
USING (bucket_id = 'documentos');