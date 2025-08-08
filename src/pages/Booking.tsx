import { useEffect, useState } from "react";
import { BookingForm } from "@/components/BookingForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
}

export default function Booking() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchServices() {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        toast({
          title: "Error loading services",
          description: "Failed to load available services. Please refresh the page.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Book Your Appointment</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience professional massage therapy and personal training in the comfort of your own home
          </p>
        </div>
        <BookingForm services={services} />
      </div>
    </div>
  );
}