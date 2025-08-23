import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
interface HeroSectionProps {
  title: string;
  subtitle: string;
  description: string;
  backgroundImage: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  badges?: string[];
}
const HeroSection = ({
  title,
  subtitle,
  description,
  backgroundImage,
  ctaPrimary = "Track Shipment",
  ctaSecondary = "Get Quote",
  badges = []
}: HeroSectionProps) => {
  const navigate = useNavigate();
  return <section className="hero-section">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: `url(${backgroundImage})`
    }} />
      
      {/* Overlay */}
      <div className="hero-overlay" />
      
      {/* Content */}
      <div className="hero-content animate-fade-in-up">
        <div className="mb-6">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
            {title}
          </h1>
          <p className="text-xl md:text-2xl font-semibold mb-4 text-white/90">
            {subtitle}
          </p>
          <p className="text-lg md:text-xl mb-8 text-white/80 max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          
          <Button variant="outline" size="lg" className="btn-hero-outline text-lg px-8 py-4 text-justify">
            <Play className="mr-2 w-5 h-5" />
            {ctaSecondary}
          </Button>
        </div>

        {/* Trust Badges */}
        {badges.length > 0 && <div className="flex flex-wrap justify-center gap-6 text-white/70">
            {badges.map((badge, index) => <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full" />
                <span className="text-sm font-medium">{badge}</span>
              </div>)}
          </div>}
      </div>
    </section>;
};
export default HeroSection;