-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role text NOT NULL DEFAULT 'user';

-- Create index for better performance on role queries
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Create security definer function to check if user is employee
CREATE OR REPLACE FUNCTION public.is_employee(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND role = 'employee'
  )
$$;

-- Update RLS policies for shortlisted_universities to allow employee access
DROP POLICY IF EXISTS "Users can view their own shortlisted universities" ON public.shortlisted_universities;
DROP POLICY IF EXISTS "Users can insert their own shortlisted universities" ON public.shortlisted_universities;
DROP POLICY IF EXISTS "Users can update their own shortlisted universities" ON public.shortlisted_universities;
DROP POLICY IF EXISTS "Users can delete their own shortlisted universities" ON public.shortlisted_universities;

CREATE POLICY "Users and employees can view shortlisted universities" 
ON public.shortlisted_universities 
FOR SELECT 
USING (auth.uid() = user_id OR public.is_employee(auth.uid()));

CREATE POLICY "Users and employees can insert shortlisted universities" 
ON public.shortlisted_universities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR public.is_employee(auth.uid()));

CREATE POLICY "Users and employees can update shortlisted universities" 
ON public.shortlisted_universities 
FOR UPDATE 
USING (auth.uid() = user_id OR public.is_employee(auth.uid()));

CREATE POLICY "Users and employees can delete shortlisted universities" 
ON public.shortlisted_universities 
FOR DELETE 
USING (auth.uid() = user_id OR public.is_employee(auth.uid()));

-- Update RLS policies for sops to allow employee access
DROP POLICY IF EXISTS "Users can view their own SOPs" ON public.sops;
DROP POLICY IF EXISTS "Users can insert their own SOPs" ON public.sops;
DROP POLICY IF EXISTS "Users can update their own SOPs" ON public.sops;
DROP POLICY IF EXISTS "Users can delete their own SOPs" ON public.sops;

CREATE POLICY "Users and employees can view SOPs" 
ON public.sops 
FOR SELECT 
USING (auth.uid() = user_id OR public.is_employee(auth.uid()));

CREATE POLICY "Users and employees can insert SOPs" 
ON public.sops 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR public.is_employee(auth.uid()));

CREATE POLICY "Users and employees can update SOPs" 
ON public.sops 
FOR UPDATE 
USING (auth.uid() = user_id OR public.is_employee(auth.uid()));

CREATE POLICY "Users and employees can delete SOPs" 
ON public.sops 
FOR DELETE 
USING (auth.uid() = user_id OR public.is_employee(auth.uid()));

-- Update RLS policies for lors to allow employee access
DROP POLICY IF EXISTS "Users can view their own LORs" ON public.lors;
DROP POLICY IF EXISTS "Users can insert their own LORs" ON public.lors;
DROP POLICY IF EXISTS "Users can update their own LORs" ON public.lors;
DROP POLICY IF EXISTS "Users can delete their own LORs" ON public.lors;

CREATE POLICY "Users and employees can view LORs" 
ON public.lors 
FOR SELECT 
USING (auth.uid() = user_id OR public.is_employee(auth.uid()));

CREATE POLICY "Users and employees can insert LORs" 
ON public.lors 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR public.is_employee(auth.uid()));

CREATE POLICY "Users and employees can update LORs" 
ON public.lors 
FOR UPDATE 
USING (auth.uid() = user_id OR public.is_employee(auth.uid()));

CREATE POLICY "Users and employees can delete LORs" 
ON public.lors 
FOR DELETE 
USING (auth.uid() = user_id OR public.is_employee(auth.uid()));

-- Add policy for employees to view all profiles
CREATE POLICY "Employees can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id OR public.is_employee(auth.uid()));