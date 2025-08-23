import { Button } from '@/components/ui/button';
import { Package, ArrowRight } from 'lucide-react';

const TrackShipmentCTA = () => {
  const scrollToTracking = () => {
    const trackingElement = document.getElementById('tracking');
    if (trackingElement) {
      trackingElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 bg-gradient-to-r from-primary to-accent">
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/20 rounded-full">
              <Package className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Track Your Shipment?
          </h2>
          
          <p className="text-xl text-white/90 mb-8">
            Get real-time updates on your package location and delivery status with our advanced tracking system.
          </p>
          
          <Button 
            onClick={scrollToTracking}
            size="lg"
            className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-4 shadow-elegant group"
          >
            <Package className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
            Track Your Shipment
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <p className="text-white/70 text-sm mt-4">
            Enter your tracking number to get instant updates
          </p>
        </div>
      </div>
    </section>
  );
};

export default TrackShipmentCTA;