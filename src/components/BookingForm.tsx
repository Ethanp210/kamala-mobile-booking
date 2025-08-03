import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, MapPin, Phone, Mail, User } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
}

interface BookingFormProps {
  services: Service[];
}

export function BookingForm({ services }: BookingFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedService, setSelectedService] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [clientInfo, setClientInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  const selectedServiceData = services.find(s => s.id === selectedService);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedService || !selectedTime || !clientInfo.name || !clientInfo.email || !clientInfo.phone || !clientInfo.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          client_name: clientInfo.name,
          client_email: clientInfo.email,
          client_phone: clientInfo.phone,
          client_address: clientInfo.address,
          service_id: selectedService,
          appointment_date: format(selectedDate, 'yyyy-MM-dd'),
          appointment_time: selectedTime,
          duration_minutes: selectedServiceData?.duration_minutes || 60,
          total_price: selectedServiceData?.price || 0,
          notes: clientInfo.notes
        });

      if (error) throw error;

      toast({
        title: "Appointment Booked!",
        description: "Your appointment has been successfully booked. You will receive a confirmation shortly."
      });

      // Reset form
      setSelectedDate(undefined);
      setSelectedService("");
      setSelectedTime("");
      setClientInfo({ name: "", email: "", phone: "", address: "", notes: "" });
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "There was an error booking your appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Book Your Appointment
        </CardTitle>
        <CardDescription>
          Schedule your relaxing massage or training session. We come to you!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Selection */}
          <div className="space-y-2">
            <Label htmlFor="service">Service *</Label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    <div className="flex justify-between items-center w-full">
                      <span>{service.name}</span>
                      <span className="text-sm text-muted-foreground ml-4">
                        ${service.price} • {service.duration_minutes}min
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedServiceData && (
              <p className="text-sm text-muted-foreground">{selectedServiceData.description}</p>
            )}
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label htmlFor="time">Time *</Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <Clock className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Choose a time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Client Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="pl-10"
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={clientInfo.email}
                  onChange={(e) => setClientInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="pl-10"
                  placeholder="your@email.com"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                value={clientInfo.phone}
                onChange={(e) => setClientInfo(prev => ({ ...prev, phone: e.target.value }))}
                className="pl-10"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="address"
                value={clientInfo.address}
                onChange={(e) => setClientInfo(prev => ({ ...prev, address: e.target.value }))}
                className="pl-10 min-h-[60px]"
                placeholder="Your complete address for the mobile service"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Special Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={clientInfo.notes}
              onChange={(e) => setClientInfo(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any special requests, health conditions, or preferences..."
              className="min-h-[80px]"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? "Booking..." : "Book Appointment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}