import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TrackingPanel from '@/components/TrackingPanel';
import AboutSection from '@/components/AboutSection';
import ServicesSection from '@/components/ServicesSection';
import TrackShipmentCTA from '@/components/TrackShipmentCTA';

// Import hero images
import heroAirFreight from '@/assets/hero-air-freight.jpg';
import heroSeaCargo from '@/assets/hero-sea-cargo.jpg';
import heroWarehouse from '@/assets/hero-warehouse.jpg';
import heroDeliveryTruck from '@/assets/hero-delivery-truck.jpg';
import heroCustoms from '@/assets/hero-customs.jpg';

const HomePage = () => {
  const heroSections = [
    {
      title: "Global Air Freight",
      subtitle: "On Time, Every Time",
      description: "Express air cargo services connecting major cities worldwide with guaranteed delivery windows and real-time tracking.",
      backgroundImage: heroAirFreight,
      ctaPrimary: "Track Airfreight",
      ctaSecondary: "Get Air Quote",
      badges: ["99.2% On-Time", "2-Day Express", "Live GPS Tracking"]
    },
    {
      title: "Ocean Logistics",
      subtitle: "At Scale",
      description: "Cost-effective sea freight solutions for large volume shipments with comprehensive container tracking and port-to-port visibility.",
      backgroundImage: heroSeaCargo,
      ctaPrimary: "Track Ocean Cargo", 
      ctaSecondary: "Container Rates",
      badges: ["FCL & LCL Options", "Port Tracking", "Customs Included"]
    },
    {
      title: "Built for Volume",
      subtitle: "Warehouse Excellence", 
      description: "State-of-the-art fulfillment centers with automated sorting, inventory management, and distribution capabilities worldwide.",
      backgroundImage: heroWarehouse,
      ctaPrimary: "Track Shipment",
      ctaSecondary: "Warehouse Tour",
      badges: ["50K+ Daily Packages", "24/7 Operations", "Climate Controlled"]
    },
    {
      title: "Last-Mile Excellence", 
      subtitle: "Door-to-Door Service",
      description: "Professional home and business delivery with signature confirmation, photo proof, and flexible scheduling options.",
      backgroundImage: heroDeliveryTruck,
      ctaPrimary: "Schedule Delivery",
      ctaSecondary: "Delivery Options", 
      badges: ["Same-Day Available", "Signature Service", "Photo Confirmation"]
    },
    {
      title: "Smart Clearance",
      subtitle: "Fewer Delays",
      description: "Expert customs brokerage services with pre-clearance capabilities, duty optimization, and compliance management.",
      backgroundImage: heroCustoms,
      ctaPrimary: "Customs Support",
      ctaSecondary: "Duty Calculator",
      badges: ["Expert Brokers", "Pre-Clearance", "Duty Optimization"]
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <main>
        {/* Hero Sections */}
        {heroSections.map((section, index) => (
          <div key={index}>
            <HeroSection
              title={section.title}
              subtitle={section.subtitle}
              description={section.description}
              backgroundImage={section.backgroundImage}
              ctaPrimary={section.ctaPrimary}
              ctaSecondary={section.ctaSecondary}
              badges={section.badges}
            />
            {/* Add Track Shipment CTA after first hero section (Global Air Freight) */}
            {index === 0 && <TrackShipmentCTA />}
          </div>
        ))}

        {/* Services Section */}
        <ServicesSection />

        {/* Tracking Panel */}
        <TrackingPanel />

        {/* About Section */}
        <AboutSection />
      </main>

      {/* JivoChat Widget */}
      <script src="//code.jivosite.com/widget/e8tTGaxiWC" async />

      {/* Footer */}
      <footer className="bg-gradient-to-r from-primary to-accent text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">SwiftPathDelivery</h3>
              <p className="text-white/80">
                Global logistics excellence with local expertise. Connecting the world, one delivery at a time.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-white/80">
                <li>Air Freight</li>
                <li>Ocean Cargo</li>
                <li>Ground Transport</li>
                <li>Customs Clearance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-white/80">
                <li>Track Package</li>
                <li>Customer Service</li>
                <li>Shipping Calculator</li>
                <li>FAQ</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-white/80">
                <li>About Us</li>
                <li>Careers</li>
                <li>Press</li>
                <li>Contact</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
            <p>&copy; 2024 SwiftPathDelivery. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;