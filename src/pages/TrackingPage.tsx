import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Copy, MapPin, Package, Clock, AlertTriangle, CheckCircle, Truck, Navigation, Send, ShoppingCart } from 'lucide-react';
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
  media_url: string | null;
  media_type: string | null;
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
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />;
      case 'in transit':
        return <Truck className="w-5 h-5" />;
      case 'customs hold':
        return <AlertTriangle className="w-5 h-5" />;
      case 'processing':
        return <Package className="w-5 h-5" />;
      case 'created':
        return <ShoppingCart className="w-5 h-5" />;
      case 'dispatched':
        return <Send className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  // Status steps for the progress bar
  const statusSteps = [
    { status: 'created', label: 'Order Placed', icon: ShoppingCart },
    { status: 'dispatched', label: 'Dispatched', icon: Send },
    { status: 'in transit', label: 'In Transit', icon: Truck },
    { status: 'processing', label: 'At Sorting Center', icon: Package },
    { status: 'out for delivery', label: 'Out for Delivery', icon: Navigation },
    { status: 'delivered', label: 'Delivered', icon: CheckCircle }
  ];

  const getStepStatus = (stepStatus: string) => {
    if (!shipment) return 'pending';
    
    const currentStatusIndex = statusSteps.findIndex(step => 
      step.status.toLowerCase() === shipment.current_status.toLowerCase()
    );
    const stepIndex = statusSteps.findIndex(step => 
      step.status.toLowerCase() === stepStatus.toLowerCase()
    );
    
    if (stepIndex < currentStatusIndex) return 'completed';
    if (stepIndex === currentStatusIndex) return 'current';
    return 'pending';
  };

  const getProgressPercentage = () => {
    if (!shipment) return 0;
    
    const currentStatusIndex = statusSteps.findIndex(step => 
      step.status.toLowerCase() === shipment.current_status.toLowerCase()
    );
    
    if (currentStatusIndex === -1) return 0;
    
    return ((currentStatusIndex + 1) / statusSteps.length) * 100;
  };

  const getStatusDescription = (status: string) => {
    switch (status.toLowerCase()) {
      case 'created':
        return 'Your package has been received and is being prepared';
      case 'dispatched':
        return 'Package has left the origin facility';
      case 'in transit':
        return 'Package is on its way to the destination';
      case 'processing':
        return 'Package is being processed at sorting facility';
      case 'out for delivery':
        return 'Package is out for delivery to your address';
      case 'delivered':
        return 'Package has been successfully delivered';
      case 'customs hold':
        return 'Package is being held by customs for inspection';
      default:
        return 'Status information will be updated soon';
    }
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
          {/* Status Progress Bar */}
          <Card className="shadow-xl">
            <CardContent className="p-8">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2 text-primary">Live Tracking - {trackingId}</h3>
                <p className="text-muted-foreground">
                  Estimated Delivery: {shipment?.eta ? new Date(shipment.eta).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'Calculating...'}
                </p>
              </div>
              
              {/* Progress Timeline */}
              <div className="flex justify-between items-center mb-8 relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted -translate-y-1/2"></div>
                <div 
                  className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
                
                {statusSteps.map((step, index) => (
                  <div key={step.status} className="flex flex-col items-center relative z-10">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      getStepStatus(step.status) === 'completed' 
                        ? 'bg-primary border-primary text-primary-foreground' 
                        : getStepStatus(step.status) === 'current'
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-background border-muted-foreground/30 text-muted-foreground'
                    }`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-sm font-medium ${
                        getStepStatus(step.status) === 'completed' || getStepStatus(step.status) === 'current'
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      }`}>
                        {step.label}
                      </p>
                      {getStepStatus(step.status) === 'current' && (
                        <p className="text-xs text-primary mt-1">Current Status</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Current Status Details */}
              {shipment && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        {getStatusIcon(shipment.current_status)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-primary mb-1">{shipment.current_status}</h4>
                        <p className="text-muted-foreground mb-2">
                          {getStatusDescription(shipment.current_status)}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {shipment.origin}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Updated: {new Date().toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Shipment Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Shipment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-muted-foreground text-sm">Tracking Number:</span>
                  <p className="font-mono font-bold text-lg">{shipment.tracking_id}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-foreground text-sm">Weight</span>
                    <p className="font-medium">3 kg</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Service Type</span>
                    <p className="font-medium">📦 Express</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-foreground text-sm">Shipping Fee</span>
                    <p className="font-medium">{shipment.currency} {shipment.package_value}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-sm">Delivery Time</span>
                    <p className="font-medium">3-5 days</p>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Customs Status:</span>
                  <p className="font-medium">
                    {shipment.is_customs_held ? '⚠️ Hold' : '✅ Cleared'}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Created:</span>
                  <p className="font-medium">
                    {new Date(shipment.created_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Sender</h4>
                  <p className="font-medium">{shipment.sender_name}</p>
                  <p className="text-sm text-muted-foreground">{shipment.sender_address}</p>
                  <p className="text-sm text-muted-foreground">🌍 {shipment.sender_country}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Receiver</h4>
                  <p className="font-medium">{shipment.receiver_name}</p>
                  <p className="text-sm text-muted-foreground">{shipment.receiver_address}</p>
                  <p className="text-sm text-muted-foreground">🌍 {shipment.receiver_country}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Package Description</h4>
                  <p className="text-sm">{shipment.package_description}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Package Media */}
          {shipment.media_url && (
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Package Media</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  {shipment.media_type === 'image' ? (
                    <img
                      src={shipment.media_url}
                      alt="Package media"
                      className="max-h-96 max-w-full rounded-lg object-contain shadow-lg"
                    />
                  ) : shipment.media_type === 'video' ? (
                    <video
                      src={shipment.media_url}
                      controls
                      className="max-h-96 max-w-full rounded-lg shadow-lg"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customs Held Alert */}
          {shipment.is_customs_held && (
            <Card className="border-destructive bg-destructive/5 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-5 h-5 mr-2 text-destructive" />
                  <span className="font-bold text-destructive">Customs Hold Notice</span>
                </div>
                <p>This package has been held by customs. Kindly message the customer service or reach us at support@swiftpathdelivery.site to remove the ban on your package by customs.</p>
                <div className="mt-3 p-3 bg-muted/50 rounded border-l-4 border-primary">
                  <p className="text-sm text-muted-foreground">
                    <strong>24/7 Expert Support:</strong> Our dedicated customs clearance specialists are available around the clock. 
                    Contact us at support@swiftpathdelivery.site and we'll respond within 1 hour to resolve your customs issue quickly and efficiently.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tracking History */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 w-5 h-5" />
                Tracking History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event, index) => (
                    <div key={event.id} className="flex items-start space-x-4 pb-4 border-b border-border/50 last:border-0">
                      <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                        index === 0 ? 'bg-primary' : 'bg-muted'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-primary">{event.status}</p>
                            {event.location && (
                              <p className="text-sm text-muted-foreground">{event.location}</p>
                            )}
                            {event.note && (
                              <p className="text-sm mt-1">{event.note}</p>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.occurred_at).toLocaleDateString()} {new Date(event.occurred_at).toLocaleTimeString()}
                          </p>
                        </div>
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