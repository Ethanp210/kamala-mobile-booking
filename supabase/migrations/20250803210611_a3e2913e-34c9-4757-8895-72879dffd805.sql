-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create availability table
CREATE TABLE public.availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_address TEXT NOT NULL,
  service_id UUID NOT NULL REFERENCES public.services(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to services and availability
CREATE POLICY "Services are viewable by everyone" 
ON public.services 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Availability is viewable by everyone" 
ON public.availability 
FOR SELECT 
USING (is_active = true);

-- Create policies for appointments (public can insert, but only business owner can view all)
CREATE POLICY "Anyone can create appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Appointments are viewable by everyone" 
ON public.appointments 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample services
INSERT INTO public.services (name, description, duration_minutes, price) VALUES
('Relaxation Massage', 'Full body relaxation massage to reduce stress and tension', 60, 80.00),
('Deep Tissue Massage', 'Therapeutic massage targeting deep muscle layers and knots', 75, 95.00),
('Sports Massage', 'Massage focused on athletic performance and recovery', 60, 85.00),
('Personal Training Session', 'One-on-one fitness training session', 60, 70.00),
('Stretching & Mobility', 'Assisted stretching and mobility work', 45, 60.00);

-- Insert sample availability (Monday to Friday, 9 AM to 6 PM)
INSERT INTO public.availability (day_of_week, start_time, end_time) VALUES
(1, '09:00', '18:00'), -- Monday
(2, '09:00', '18:00'), -- Tuesday
(3, '09:00', '18:00'), -- Wednesday
(4, '09:00', '18:00'), -- Thursday
(5, '09:00', '18:00'), -- Friday
(6, '10:00', '16:00'); -- Saturday