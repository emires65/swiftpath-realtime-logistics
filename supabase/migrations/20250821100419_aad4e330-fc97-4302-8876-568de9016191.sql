-- Create shipments table
CREATE TABLE public.shipments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  sender_name TEXT NOT NULL,
  sender_address TEXT NOT NULL,
  sender_country TEXT NOT NULL,
  sender_email TEXT,
  receiver_name TEXT NOT NULL,
  receiver_address TEXT NOT NULL,
  receiver_country TEXT NOT NULL,
  receiver_email TEXT,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  
  weight DECIMAL,
  shipping_fee DECIMAL,
  package_description TEXT NOT NULL,
  package_value DECIMAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  days_of_package INTEGER,
  
  current_status TEXT NOT NULL DEFAULT 'Created',
  is_customs_held BOOLEAN NOT NULL DEFAULT false,
  eta TIMESTAMP WITH TIME ZONE,
  last_scan_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  lat DECIMAL,
  lng DECIMAL
);

-- Create shipment events table
CREATE TABLE public.shipment_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  
  status TEXT NOT NULL,
  note TEXT,
  location TEXT,
  lat DECIMAL,
  lng DECIMAL,
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to shipments (no auth required for tracking)
CREATE POLICY "Anyone can view shipments" 
ON public.shipments 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can view shipment events" 
ON public.shipment_events 
FOR SELECT 
USING (true);

-- Create policies for admin operations (we'll implement admin auth separately)
CREATE POLICY "Admin can manage shipments" 
ON public.shipments 
FOR ALL 
USING (true);

CREATE POLICY "Admin can manage shipment events" 
ON public.shipment_events 
FOR ALL 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live tracking updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.shipments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shipment_events;

-- Set replica identity for realtime updates
ALTER TABLE public.shipments REPLICA IDENTITY FULL;
ALTER TABLE public.shipment_events REPLICA IDENTITY FULL;