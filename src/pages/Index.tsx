import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, Mail, Clock, CheckCircle, Home, Calendar } from "lucide-react";
import { useEffect } from "react";

export default function Index() {
  useEffect(() => {
    // Load Setmore script
    const script = document.createElement('script');
    script.id = 'setmore_script';
    script.type = 'text/javascript';
    script.src = 'https://assets.setmore.com/integration/static/setmoreIframeLive.js';
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.getElementById('setmore_script');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const handleBookingClick = () => {
    window.open('https://kamalamassage.setmore.com', '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Kamala Massage</h1>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <a href="/auth">Sign In</a>
            </Button>
            <Button variant="outline">
              Payment Portal
            </Button>
            <Button onClick={handleBookingClick}>
              <Calendar className="mr-2 h-4 w-4" />
              Book Now
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto">
          <h2 className="text-5xl font-bold mb-6 text-foreground">
            Professional Mobile Massage & Personal Training
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Experience the ultimate convenience with our mobile services. We bring professional massage therapy 
            and personal training directly to your home, office, or preferred location.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleBookingClick}>
              <Calendar className="mr-2 h-5 w-5" />
              Book Your Session
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="tel:+12192993846">
                <Phone className="mr-2 h-5 w-5" />
                Call Us Now
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">Why Choose Mobile Services?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Home className="h-12 w-12 text-primary mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Your Space, Your Comfort</h4>
                <p className="text-muted-foreground">
                  Enjoy professional services in the privacy and comfort of your own environment
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Flexible Scheduling</h4>
                <p className="text-muted-foreground">
                  Book sessions that fit your schedule, including evenings and weekends
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">Professional Quality</h4>
                <p className="text-muted-foreground">
                  Licensed therapists and certified trainers with professional equipment
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">Our Services</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <h4 className="text-xl font-semibold mb-3">Swedish Massage</h4>
                <p className="text-muted-foreground mb-4">
                  Relaxing full-body massage using long, flowing strokes to reduce tension and promote wellness.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-primary">60 min</span>
                  <Button onClick={handleBookingClick}>Book Now</Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h4 className="text-xl font-semibold mb-3">Deep Tissue Massage</h4>
                <p className="text-muted-foreground mb-4">
                  Therapeutic massage targeting deeper muscle layers to release chronic tension and knots.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-primary">60 min</span>
                  <Button onClick={handleBookingClick}>Book Now</Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h4 className="text-xl font-semibold mb-3">Personal Training</h4>
                <p className="text-muted-foreground mb-4">
                  One-on-one fitness training sessions customized to your goals and fitness level.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-primary">60 min</span>
                  <Button onClick={handleBookingClick}>Book Now</Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h4 className="text-xl font-semibold mb-3">Sports Massage</h4>
                <p className="text-muted-foreground mb-4">
                  Specialized massage techniques for athletes to enhance performance and aid recovery.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-primary">60 min</span>
                  <Button onClick={handleBookingClick}>Book Now</Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h4 className="text-xl font-semibold mb-3">Prenatal Massage</h4>
                <p className="text-muted-foreground mb-4">
                  Gentle, safe massage therapy designed specifically for expectant mothers.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-primary">60 min</span>
                  <Button onClick={handleBookingClick}>Book Now</Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h4 className="text-xl font-semibold mb-3">Couples Massage</h4>
                <p className="text-muted-foreground mb-4">
                  Relaxing massage experience for two people in the comfort of your own space.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-primary">90 min</span>
                  <Button onClick={handleBookingClick}>Book Now</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">Contact Information</h3>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Phone className="h-8 w-8 text-primary mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">Call Carol</h4>
              <a href="tel:+12192993846" className="text-muted-foreground hover:text-primary transition-colors">
                (219) 299-3846
              </a>
            </div>
            <div>
              <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">Email</h4>
              <a href="mailto:info@kamalamassage.com" className="text-muted-foreground hover:text-primary transition-colors">
                info@kamalamassage.com
              </a>
            </div>
            <div>
              <Clock className="h-8 w-8 text-primary mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">Hours</h4>
              <p className="text-muted-foreground">Mon-Sat: 9AM-6PM</p>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Footer */}
      <footer className="py-8 px-4 bg-card">
        <div className="container mx-auto text-center">
          <h4 className="text-lg font-semibold mb-2 text-foreground">Kamala Massage</h4>
          <p className="text-muted-foreground">Bringing wellness to your doorstep</p>
        </div>
      </footer>
    </div>
  );
}