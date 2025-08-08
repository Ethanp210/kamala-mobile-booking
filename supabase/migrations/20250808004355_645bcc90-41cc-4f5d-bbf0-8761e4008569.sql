-- Fix the user creation issue by ensuring proper schema references

-- Drop and recreate the trigger function with proper schema qualification
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a more robust function that handles all edge cases
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  -- Use explicit schema qualification and handle any conflicts
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.email, ''),
    'customer'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, profiles.email),
    updated_at = now();
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also ensure the profiles table has the correct default
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'customer';

-- Make sure the enum values are properly accessible
GRANT USAGE ON TYPE public.user_role TO authenticated;
GRANT USAGE ON TYPE public.user_role TO anon;