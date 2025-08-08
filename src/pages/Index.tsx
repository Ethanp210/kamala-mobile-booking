import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceCard } from "@/components/ServiceCard";
import { CalendarIcon, MapPin, Phone, Mail, Clock, Heart, Zap, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
}

const Index = () => {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    async function fetchServices() {
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      setServices(data || []);
    }

    fetchServices();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary">Kamala Massage</h1>
              <p className="text-sm text-muted-foreground">Mobile Massage & Personal Training</p>
            </div>
            <div className="flex gap-2">
              <Link to="/auth">
                <Button size="lg" className="shadow-md">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Sign In / Book Now
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="lg">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Wellness Comes to You
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Experience professional massage therapy and personal training in the comfort of your own home. 
            Our mobile services bring relaxation and wellness directly to your doorstep.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="px-8 py-6 text-lg shadow-lg">
                <CalendarIcon className="mr-2 h-5 w-5" />
                Sign In to Book
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
              <Phone className="mr-2 h-5 w-5" />
              Call Us
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Why Choose Mobile Service?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enjoy the convenience and comfort of professional wellness services at home
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <MapPin className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Home Convenience</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  No need to travel. We bring all necessary equipment to your home, 
                  creating a professional spa experience in your own space.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Heart className="h-12 w-12 mx-auto text-accent mb-4" />
                <CardTitle>Personalized Care</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  One-on-one attention tailored to your specific needs, preferences, 
                  and health conditions in a private, comfortable environment.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Professional Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Licensed and experienced therapist with professional-grade equipment 
                  and techniques for optimal results.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Our Services</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional massage therapy and personal training services designed to improve your wellness
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                name={service.name}
                description={service.description || ""}
                duration={service.duration_minutes}
                price={service.price}
              />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/auth">
              <Button size="lg" variant="outline">
                Sign In to View Services & Book
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 px-4 bg-card">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Get in Touch</h3>
            <p className="text-muted-foreground">Ready to book or have questions? We're here to help</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <Phone className="h-8 w-8 mx-auto text-primary mb-3" />
              <h4 className="font-semibold mb-2">Call Carol</h4>
              <p className="text-muted-foreground">(219) 299-3846</p>
            </div>
            <div className="text-center">
              <Mail className="h-8 w-8 mx-auto text-primary mb-3" />
              <h4 className="font-semibold mb-2">Email</h4>
              <p className="text-muted-foreground"></p>
            </div>
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto text-primary mb-3" />
              <h4 className="font-semibold mb-2">Hours</h4>
              <p className="text-muted-foreground">Mon-Sat: 9AM-6PM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-muted/30">
        <div className="container mx-auto text-center">
          <h4 className="font-semibold text-primary mb-2">Kamala Massage</h4>
          <p className="text-sm text-muted-foreground">
            Professional Mobile Massage & Personal Training Services
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
