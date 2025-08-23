import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, Ship, Truck, Shield, Clock, Star, Users, Globe } from 'lucide-react';

const ServicesSection = () => {
  const services = [
    {
      icon: <Plane className="w-8 h-8" />,
      title: "Express Air Freight",
      description: "Lightning-fast global air cargo with guaranteed delivery windows and premium handling for urgent shipments.",
      features: ["2-Day Express Delivery", "Priority Handling", "Temperature Controlled", "24/7 Tracking"]
    },
    {
      icon: <Ship className="w-8 h-8" />,
      title: "Ocean Logistics",
      description: "Cost-effective sea freight solutions with full container load (FCL) and less container load (LCL) options.",
      features: ["FCL & LCL Options", "Port-to-Port Tracking", "Customs Included", "Competitive Rates"]
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Ground Transportation",
      description: "Reliable last-mile delivery with flexible scheduling, signature confirmation, and photo proof of delivery.",
      features: ["Same-Day Delivery", "Signature Service", "Photo Confirmation", "Flexible Scheduling"]
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Custom Clearance",
      description: "Expert customs brokerage with pre-clearance capabilities, duty optimization, and full compliance management.",
      features: ["Expert Brokers", "Pre-Clearance", "Duty Optimization", "Compliance Management"]
    }
  ];

  const whyChooseUs = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Lightning Fast Delivery",
      description: "99.2% on-time delivery rate with express options available globally"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Premium Customer Care",
      description: "Dedicated support team treating every customer like family with 24/7 availability"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Personal Touch",
      description: "Individual attention to each shipment with personalized tracking and updates"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Network",
      description: "Worldwide coverage with local expertise in over 150+ countries"
    }
  ];

  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Our Premium Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive logistics solutions designed to exceed your expectations with speed, reliability, and exceptional customer care.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {services.map((service, index) => (
            <Card key={index} className="group hover:shadow-elegant transition-all duration-300 border-border/50 hover:border-primary/20">
              <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-primary to-accent text-white group-hover:scale-110 transition-transform">
                    {service.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {service.title}
                    </CardTitle>
                  </div>
                </div>
                <CardDescription className="text-base leading-relaxed">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-accent rounded-full" />
                      <span className="text-sm text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Why Choose Us */}
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4 text-foreground">Why Choose SwiftPathDelivery?</h3>
          <p className="text-lg text-muted-foreground">The difference that makes us your trusted logistics partner</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyChooseUs.map((item, index) => (
            <Card key={index} className="text-center group hover:shadow-glow transition-all duration-300 bg-card/50 hover:bg-card">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-primary to-accent text-white group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                </div>
                <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;