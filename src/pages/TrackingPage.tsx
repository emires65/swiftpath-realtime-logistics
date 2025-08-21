import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Copy, MapPin, Package, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Shipment {
  id: string;
  tracking_id: string;
  sender_name: string;
  sender_address: string;
  sender_country: string;
  receiver_name: string;
  receiver_address: string;
  receiver_country: string;
  origin: string;
  destination: string;
  package_description: string;
  package_value: number;
  currency: string;
  current_status: string;
  is_customs_held: boolean;
  eta: string | null;
  last_scan_at: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

interface ShipmentEvent {
  id: string;
  status: string;
  note: string | null;
  location: string | null;
  lat: number | null;
  lng: number | null;
  occurred_at: string;
}

const TrackingPage = () => {
  const { trackingId } = useParams<{ trackingId: string }>();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [events, setEvents] = useState<ShipmentEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (trackingId) {
      fetchShipmentData();
      subscribeToUpdates();
    }
  }, [trackingId]);

  const fetchShipmentData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch shipment
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .select('*')
        .eq('tracking_id', trackingId)
        .single();

      if (shipmentError) {
        if (shipmentError.code === 'PGRST116') {
          setError('Tracking ID not found. Please check your tracking number and try again.');
        } else {
          setError('Failed to fetch shipment data');
        }
        return;
      }

      setShipment(shipmentData);

      // Fetch events
      const { data: eventsData, error: eventsError } = await supabase
        .from('shipment_events')
        .select('*')
        .eq('shipment_id', shipmentData.id)
        .order('occurred_at', { ascending: false });

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
      } else {
        setEvents(eventsData || []);
      }

    } catch (error) {
      console.error('Error fetching shipment data:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    if (!trackingId) return;

    const channel = supabase
      .channel(`shipment-${trackingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shipments',
          filter: `tracking_id=eq.${trackingId}`
        },
        (payload) => {
          console.log('Shipment update:', payload);
          if (payload.new) {
            setShipment(payload.new as Shipment);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shipment_events'
        },
        (payload) => {
          console.log('Event update:', payload);
          fetchShipmentData(); // Refresh all data when events change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const copyTrackingLink = () => {
    const url = `${window.location.origin}/track/${trackingId}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Tracking link copied to clipboard!');
    });
  };

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('delivered')) return 'bg-success';
    if (lowerStatus.includes('out for delivery')) return 'bg-warning';
    if (lowerStatus.includes('in transit')) return 'bg-logistics-cyan';
    if (lowerStatus.includes('customs')) return 'bg-logistics-purple';
    return 'bg-primary';
  };

  const getStatusIcon = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('delivered')) return <CheckCircle className="w-4 h-4" />;
    if (lowerStatus.includes('customs')) return <AlertTriangle className="w-4 h-4" />;
    return <Package className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Loading shipment details...</p>
        </div>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Tracking Not Found</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate('/')} className="bg-primary hover:bg-primary/90">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Home
          </Button>
          <Button variant="outline" onClick={copyTrackingLink}>
            <Copy className="mr-2 w-4 h-4" />
            Share Link
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Shipment Summary Card */}
          <Card className="shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">Shipment Details</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={`${getStatusColor(shipment.current_status)} text-white px-4 py-2`}>
                    {getStatusIcon(shipment.current_status)}
                    <span className="ml-2">{shipment.current_status}</span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2 text-muted-foreground">Tracking ID</h3>
                  <p className="text-2xl font-mono font-bold">{shipment.tracking_id}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-muted-foreground">Service</h3>
                  <p className="text-lg">Express International</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2 text-muted-foreground">From</h3>
                  <p className="font-medium">{shipment.sender_name}</p>
                  <p className="text-sm text-muted-foreground">{shipment.origin}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-muted-foreground">To</h3>
                  <p className="font-medium">{shipment.receiver_name}</p>
                  <p className="text-sm text-muted-foreground">{shipment.destination}</p>
                </div>
              </div>

              {shipment.eta && (
                <div>
                  <h3 className="font-semibold mb-2 text-muted-foreground">Estimated Delivery</h3>
                  <p className="text-lg font-medium">
                    {new Date(shipment.eta).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Package:</span>
                  <p className="font-medium">{shipment.package_description}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Value:</span>
                  <p className="font-medium">{shipment.currency} {shipment.package_value}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Update:</span>
                  <p className="font-medium">
                    {shipment.last_scan_at 
                      ? new Date(shipment.last_scan_at).toLocaleString()
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customs Held Alert */}
          {shipment.is_customs_held && (
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="p-6">
                <div className="customs-alert">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    <span className="font-bold">Customs Hold Notice</span>
                  </div>
                  <p>Your goods have been held by customs. Please message customer service for assistance. Thank you.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Live Map Placeholder */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 w-5 h-5" />
                Live Tracking Map
                <Badge variant="secondary" className="ml-2 bg-success/10 text-success">Live</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg flex items-center justify-center border-2 border-dashed border-primary/20">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
                  <p className="text-muted-foreground">Interactive map coming soon</p>
                  {shipment.lat && shipment.lng && (
                    <p className="text-sm font-mono">
                      Current: {shipment.lat.toFixed(4)}, {shipment.lng.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 w-5 h-5" />
                Shipment Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {events.length > 0 ? (
                <div className="space-y-6">
                  {events.map((event, index) => (
                    <div key={event.id} className="flex items-start space-x-4">
                      <div className={`w-4 h-4 rounded-full mt-1 flex-shrink-0 ${
                        index === 0 ? 'bg-success animate-pulse' : 'bg-muted'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{event.status}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.occurred_at).toLocaleString()}
                          </p>
                        </div>
                        {event.location && (
                          <p className="text-sm text-muted-foreground">{event.location}</p>
                        )}
                        {event.note && (
                          <p className="text-sm">{event.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tracking events available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;