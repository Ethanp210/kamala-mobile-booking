-- Remove all admin-related functionality and simplify the database
-- Drop policies first to avoid dependency issues

-- Drop admin-related policies on profiles table
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Now drop admin-related functions
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;

-- Simplify profiles table - remove role column since we don't need admin functionality
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Create simple policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (id = auth.uid());

-- Update the handle_new_user function to not include role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, profiles.email),
    updated_at = now();
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;