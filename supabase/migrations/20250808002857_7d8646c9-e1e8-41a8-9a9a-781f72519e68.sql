-- Transform to custom booking system with customer accounts
-- First, add user_id to appointments for customer ownership
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create user roles enum for better type safety
CREATE TYPE public.user_role AS ENUM ('customer', 'admin', 'super_admin');

-- Update profiles table to use enum and handle the conversion properly
-- First drop the default, then change type, then set new default
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;
ALTER TABLE public.profiles ALTER COLUMN role TYPE user_role USING 
  CASE 
    WHEN role = 'admin' THEN 'admin'::user_role
    ELSE 'customer'::user_role
  END;
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'customer'::user_role;

-- Update the handle_new_user function to create customer profiles by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id, 
    NEW.email,
    'customer'::user_role  -- Default new users to customer role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check user roles (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Update RLS policies for new role-based access

-- Drop existing appointment policies
DROP POLICY IF EXISTS "Authenticated users can view appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated users can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated users can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated users can delete appointments" ON public.appointments;

-- Create new role-based policies for appointments
-- Customers can only see their own appointments
CREATE POLICY "Customers can view own appointments" 
ON public.appointments 
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() OR 
  public.get_user_role(auth.uid()) IN ('admin', 'super_admin')
);

-- Customers can create appointments for themselves
CREATE POLICY "Customers can create own appointments" 
ON public.appointments 
FOR INSERT 
TO authenticated
WITH CHECK (
  user_id = auth.uid() OR 
  public.get_user_role(auth.uid()) IN ('admin', 'super_admin')
);

-- Customers can update their own appointments, admins can update any
CREATE POLICY "Users can update relevant appointments" 
ON public.appointments 
FOR UPDATE 
TO authenticated
USING (
  user_id = auth.uid() OR 
  public.get_user_role(auth.uid()) IN ('admin', 'super_admin')
);

-- Only admins can delete appointments
CREATE POLICY "Admins can delete appointments" 
ON public.appointments 
FOR DELETE 
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('admin', 'super_admin'));

-- Update profiles policies for role management
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Users can view their own profile, admins can view all
CREATE POLICY "Users can view relevant profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  id = auth.uid() OR 
  public.get_user_role(auth.uid()) IN ('admin', 'super_admin')
);

-- Users can update their own profile
CREATE POLICY "Users can update profiles" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (
  id = auth.uid() OR 
  public.get_user_role(auth.uid()) IN ('admin', 'super_admin')
);

-- Only authenticated users can create profiles (customers self-register)
CREATE POLICY "Users can create customer profiles" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (
  (id = auth.uid() AND role = 'customer') OR 
  public.get_user_role(auth.uid()) IN ('admin', 'super_admin')
);

-- Add some sample availability data for booking
INSERT INTO public.availability (day_of_week, start_time, end_time, is_active) VALUES
(1, '09:00:00', '17:00:00', true),  -- Monday
(2, '09:00:00', '17:00:00', true),  -- Tuesday  
(3, '09:00:00', '17:00:00', true),  -- Wednesday
(4, '09:00:00', '17:00:00', true),  -- Thursday
(5, '09:00:00', '17:00:00', true),  -- Friday
(6, '09:00:00', '15:00:00', true)   -- Saturday
ON CONFLICT DO NOTHING;