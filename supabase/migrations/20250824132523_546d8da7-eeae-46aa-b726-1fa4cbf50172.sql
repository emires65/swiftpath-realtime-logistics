-- Tighten public data access and add safe RPCs for public tracking

-- 1) Remove overly permissive public SELECT policies
DROP POLICY IF EXISTS "Public can view shipments by tracking_id" ON public.shipments;
DROP POLICY IF EXISTS "Public can view events by shipment" ON public.shipment_events;

-- 2) Create SECURITY DEFINER functions that return only non-PII fields
CREATE OR REPLACE FUNCTION public.get_public_shipment_by_tracking_id(tracking_code text)
RETURNS TABLE(
  id uuid,
  tracking_id text,
  origin text,
  destination text,
  package_description text,
  current_status text,
  eta timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  media_url text,
  media_type text,
  lat numeric,
  lng numeric,
  is_customs_held boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    s.id,
    s.tracking_id,
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
    s.lng,
    s.is_customs_held
  FROM public.shipments s
  WHERE s.tracking_id = tracking_code
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_public_shipment_events_by_tracking_id(tracking_code text)
RETURNS TABLE(
  id uuid,
  status text,
  location text,
  note text,
  occurred_at timestamptz,
  lat numeric,
  lng numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
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

-- 3) Allow anonymous execution of the safe RPCs
GRANT EXECUTE ON FUNCTION public.get_public_shipment_by_tracking_id(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_shipment_events_by_tracking_id(text) TO anon;