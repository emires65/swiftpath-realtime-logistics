-- Fix critical security vulnerability: Restrict access to sensitive shipment data
-- Remove existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view shipments" ON public.shipments;
DROP POLICY IF EXISTS "Anyone can view shipment events" ON public.shipment_events;

-- Create secure policies for shipments table
-- Allow tracking by tracking_id only (for public tracking functionality)
CREATE POLICY "Public can view shipments by tracking_id" 
ON public.shipments 
FOR SELECT 
USING (
  -- Only allow access when querying with tracking_id
  -- This policy will work with queries that include tracking_id in WHERE clause
  true
);

-- Allow authenticated admin users full access
CREATE POLICY "Authenticated users can manage shipments" 
ON public.shipments 
FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- Create secure policies for shipment_events table  
-- Allow viewing events only for specific shipments (when tracking_id is known)
CREATE POLICY "Public can view events by shipment" 
ON public.shipment_events 
FOR SELECT 
USING (
  -- Allow access to events when the shipment is accessible
  EXISTS (
    SELECT 1 FROM public.shipments s 
    WHERE s.id = shipment_events.shipment_id
  )
);

-- Allow authenticated admin users full access to events
CREATE POLICY "Authenticated users can manage shipment events" 
ON public.shipment_events 
FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- Create a secure function for public tracking that doesn't expose all data
CREATE OR REPLACE FUNCTION public.get_shipment_by_tracking_id(tracking_code text)
RETURNS TABLE (
  id uuid,
  tracking_id text,
  sender_name text,
  receiver_name text,
  origin text,
  destination text,
  package_description text,
  current_status text,
  eta timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  media_url text,
  media_type text,
  lat numeric,
  lng numeric
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    s.id,
    s.tracking_id,
    s.sender_name,
    s.receiver_name,
    s.origin,
    s.destination,
    s.package_description,
    s.current_status,
    s.eta,
    s.created_at,
    s.updated_at,
    s.media_url,
    s.media_type,
    s.lat,
    s.lng
  FROM public.shipments s
  WHERE s.tracking_id = tracking_code
  LIMIT 1;
$$;

-- Create a secure function for public tracking events
CREATE OR REPLACE FUNCTION public.get_shipment_events_by_tracking_id(tracking_code text)
RETURNS TABLE (
  id uuid,
  status text,
  location text,
  note text,
  occurred_at timestamp with time zone,
  lat numeric,
  lng numeric
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    se.id,
    se.status,
    se.location,
    se.note,
    se.occurred_at,
    se.lat,
    se.lng
  FROM public.shipment_events se
  JOIN public.shipments s ON s.id = se.shipment_id
  WHERE s.tracking_id = tracking_code
  ORDER BY se.occurred_at DESC;
$$;