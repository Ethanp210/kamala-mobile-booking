-- Fix security issues by setting proper search_path for functions

-- Fix get_available_time_slots function
CREATE OR REPLACE FUNCTION public.get_available_time_slots(
  booking_date date,
  service_duration_minutes integer DEFAULT 60
) RETURNS text[] 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  available_slots text[] := ARRAY['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  booked_slots text[];
  slot text;
  result_slots text[] := '{}';
BEGIN
  -- Get all booked time slots for the given date (excluding cancelled appointments)
  SELECT array_agg(appointment_time::text)
  INTO booked_slots
  FROM public.appointments
  WHERE appointment_date = booking_date
    AND status != 'cancelled'
    AND cancelled_at IS NULL;

  -- Filter out booked slots
  FOREACH slot IN ARRAY available_slots LOOP
    IF booked_slots IS NULL OR NOT (slot = ANY(booked_slots)) THEN
      result_slots := array_append(result_slots, slot);
    END IF;
  END LOOP;

  RETURN result_slots;
END;
$$;

-- Fix handle_appointment_cancellation function
CREATE OR REPLACE FUNCTION public.handle_appointment_cancellation()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- If cancelled_at is being set and wasn't set before, update status
  IF NEW.cancelled_at IS NOT NULL AND OLD.cancelled_at IS NULL THEN
    NEW.status = 'cancelled';
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;