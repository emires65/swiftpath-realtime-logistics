import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, Clock, Shield, Truck, Users, Award } from 'lucide-react';

const AboutSection = () => {
  const [counters, setCounters] = useState({
    onTime: 0,
    countries: 0,
    packages: 0,
    satisfaction: 0
  });

  useEffect(() => {
    const targets = {
      onTime: 98.7,
      countries: 195,
      packages: 50000,
      satisfaction: 99.2
    };

    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setCounters({
        onTime: Math.min(targets.onTime, targets.onTime * progress),
        countries: Math.min(targets.countries, Math.floor(targets.countries * progress)),
        packages: Math.min(targets.packages, Math.floor(targets.packages * progress)),
        satisfaction: Math.min(targets.satisfaction, targets.satisfaction * progress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setCounters(targets);
      }
    }, increment);

    return () => clearInterval(timer);
  }, []);

  return (
    <section id="about" className="py-20 bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Global Logistics Excellence
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Connecting the world through reliable, fast, and secure shipping solutions. 
              Our commitment to innovation and customer satisfaction drives everything we do.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="text-center p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-0">
                <div className="text-4xl font-bold text-primary mb-2">
                  {counters.onTime.toFixed(1)}%
                </div>
                <div className="text-sm font-medium text-muted-foreground">On-Time Delivery</div>
              </CardContent>
            </Card>

            <Card className="text-center p-6 bg-gradient-to-br from-accent/5 to-logistics-cyan/5 border-accent/20">
              <CardContent className="p-0">
                <div className="text-4xl font-bold text-accent mb-2">
                  {counters.countries}
                </div>
                <div className="text-sm font-medium text-muted-foreground">Countries Served</div>
              </CardContent>
            </Card>

            <Card className="text-center p-6 bg-gradient-to-br from-logistics-cyan/5 to-logistics-purple/5 border-logistics-cyan/20">
              <CardContent className="p-0">
                <div className="text-4xl font-bold text-logistics-cyan mb-2">
                  {(counters.packages / 1000).toFixed(0)}K+
                </div>
                <div className="text-sm font-medium text-muted-foreground">Packages Daily</div>
              </CardContent>
            </Card>

            <Card className="text-center p-6 bg-gradient-to-br from-logistics-purple/5 to-primary/5 border-logistics-purple/20">
              <CardContent className="p-0">
                <div className="text-4xl font-bold text-logistics-purple mb-2">
                  {counters.satisfaction.toFixed(1)}%
                </div>
                <div className="text-sm font-medium text-muted-foreground">Customer Satisfaction</div>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Global Coverage</h3>
              <p className="text-muted-foreground leading-relaxed">
                Comprehensive worldwide network spanning 195 countries with local expertise and international standards.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-accent to-logistics-cyan rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Lightning Fast</h3>
              <p className="text-muted-foreground leading-relaxed">
                Express delivery options with same-day and next-day service available in major metropolitan areas.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-logistics-cyan to-logistics-purple rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Customs Expertise</h3>
              <p className="text-muted-foreground leading-relaxed">
                Dedicated customs clearance specialists ensuring smooth international shipping with minimal delays.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-logistics-purple to-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Fleet Excellence</h3>
              <p className="text-muted-foreground leading-relaxed">
                Modern, eco-friendly vehicle fleet with advanced tracking technology and professional drivers.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">24/7 Support</h3>
              <p className="text-muted-foreground leading-relaxed">
                Round-the-clock customer service with multilingual support and dedicated account management.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-accent to-logistics-cyan rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Sustainability</h3>
              <p className="text-muted-foreground leading-relaxed">
                Carbon-neutral shipping options and commitment to environmental responsibility in all operations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;