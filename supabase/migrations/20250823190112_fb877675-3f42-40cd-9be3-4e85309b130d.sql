-- Create storage bucket for shipment media
INSERT INTO storage.buckets (id, name, public) VALUES ('shipment-media', 'shipment-media', true);

-- Add media columns to shipments table
ALTER TABLE public.shipments 
ADD COLUMN media_url TEXT,
ADD COLUMN media_type TEXT CHECK (media_type IN ('image', 'video'));

-- Create storage policies for shipment media
CREATE POLICY "Shipment media are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'shipment-media');

CREATE POLICY "Admin can upload shipment media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'shipment-media');

CREATE POLICY "Admin can update shipment media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'shipment-media');

CREATE POLICY "Admin can delete shipment media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'shipment-media');