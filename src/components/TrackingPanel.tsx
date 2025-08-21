import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Package, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const TrackingPanel = () => {
  const [trackingId, setTrackingId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingId.trim()) {
      toast.error('Please enter a tracking ID');
      return;
    }

    setIsLoading(true);
    
    // Simulate loading for better UX
    setTimeout(() => {
      setIsLoading(false);
      navigate(`/track/${trackingId.trim()}`);
    }, 800);
  };

  return (
    <section id="tracking" className="py-20 bg-gradient-to-br from-muted to-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Track Your Shipment
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Get real-time updates on your package location and delivery status
            </p>
          </div>

          {/* Main Tracking Card */}
          <Card className="tracking-card mb-12">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Enter your tracking ID (e.g., SPD123456789)"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      className="h-14 text-lg px-6 border-2 focus:border-primary"
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="h-14 px-8 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Search className="mr-2 w-5 h-5" />
                        Track Package
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Updates</h3>
              <p className="text-muted-foreground">
                Live tracking with precise location updates every step of the way
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-r from-accent to-logistics-cyan rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Interactive Map</h3>
              <p className="text-muted-foreground">
                Visual route tracking with live map updates and delivery timeline
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-r from-logistics-cyan to-logistics-purple rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Accurate ETAs</h3>
              <p className="text-muted-foreground">
                Precise delivery time estimates with proactive delay notifications
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrackingPanel;