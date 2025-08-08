-- Fix user creation issues and set super_admin role

-- First, let's check if there are any issues with the policies
-- Update the profiles policy to be more permissive for user creation
DROP POLICY IF EXISTS "Users can create customer profiles" ON public.profiles;

-- Allow any authenticated user to create their own profile
CREATE POLICY "Users can create own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (
  id = auth.uid()
);

-- Fix the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id, 
    NEW.email,
    'customer'::user_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  RETURN NEW;
END;
$$;

-- Update your existing account to super_admin (assuming you're the first admin user)
-- This will find the admin user and make them super_admin
UPDATE public.profiles 
SET role = 'super_admin'::user_role 
WHERE role = 'admin'::user_role
AND id IN (
  SELECT id FROM public.profiles 
  WHERE role = 'admin'::user_role 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- Alternative: If you know your email, uncomment and update this line:
-- UPDATE public.profiles SET role = 'super_admin'::user_role WHERE email = 'your-email@example.com';