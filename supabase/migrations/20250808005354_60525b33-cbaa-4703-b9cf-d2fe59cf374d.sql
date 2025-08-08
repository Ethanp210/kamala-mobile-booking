-- Add calendar sync functionality and improve appointment management

-- Add external_calendar_id column for calendar sync
ALTER TABLE public.appointments 
ADD COLUMN external_calendar_id text,
ADD COLUMN cancelled_at timestamp with time zone,
ADD COLUMN cancellation_reason text;

-- Create a function to get available time slots for a specific date
CREATE OR REPLACE FUNCTION public.get_available_time_slots(
  booking_date date,
  service_duration_minutes integer DEFAULT 60
) RETURNS text[] AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policy for the new function
GRANT EXECUTE ON FUNCTION public.get_available_time_slots TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_available_time_slots TO anon;

-- Update appointments RLS policies to handle cancellation
CREATE POLICY "Users can cancel own appointments"
ON public.appointments 
FOR UPDATE 
USING ((user_id = auth.uid()) OR (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])))
WITH CHECK ((user_id = auth.uid()) OR (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role])));

-- Create a trigger to automatically update updated_at when appointments are cancelled
CREATE OR REPLACE FUNCTION public.handle_appointment_cancellation()
RETURNS TRIGGER AS $$
BEGIN
  -- If cancelled_at is being set and wasn't set before, update status
  IF NEW.cancelled_at IS NOT NULL AND OLD.cancelled_at IS NULL THEN
    NEW.status = 'cancelled';
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_appointment_cancellation
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.handle_appointment_cancellation();