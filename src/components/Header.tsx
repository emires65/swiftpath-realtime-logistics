import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Menu, X, Package, MapPin, Users, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const navigate = useNavigate();

  const handleTrackingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      toast.error('Please enter a tracking ID');
      return;
    }
    navigate(`/track/${trackingId.trim()}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SwiftPathDelivery
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#services" className="text-foreground hover:text-primary transition-colors">Services</a>
            <a href="#tracking" className="text-foreground hover:text-primary transition-colors">Track</a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors">About</a>
          </nav>

          {/* Desktop Tracking */}
          <div className="hidden lg:flex items-center space-x-4">
            <form onSubmit={handleTrackingSubmit} className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Enter tracking ID"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="w-48"
              />
              <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90">
                <Search className="w-4 h-4" />
              </Button>
            </form>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-border">
            <div className="flex flex-col space-y-4 pt-4">
              <form onSubmit={handleTrackingSubmit} className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Enter tracking ID"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90">
                  Track
                </Button>
              </form>
              
              <nav className="flex flex-col space-y-2">
                <a href="#services" className="text-foreground hover:text-primary py-2">Services</a>
                <a href="#tracking" className="text-foreground hover:text-primary py-2">Track Shipment</a>
                <a href="#about" className="text-foreground hover:text-primary py-2">About Us</a>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;