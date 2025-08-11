-- Create cvs table to match the pattern of sops and lors tables
-- This allows employees to upload Google Drive links for CVs that users can access

CREATE TABLE IF NOT EXISTS public.cvs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  google_docs_link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trigger for updating updated_at
CREATE TRIGGER update_cvs_updated_at
  BEFORE UPDATE ON public.cvs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on cvs table
ALTER TABLE public.cvs ENABLE ROW LEVEL SECURITY;

-- Create policies for cvs table (same as sops and lors - allow employees)
DROP POLICY IF EXISTS "Users and employees can view CVs" ON public.cvs;
CREATE POLICY "Users and employees can view CVs" 
ON public.cvs 
FOR SELECT 
USING (auth.uid() = user_id OR public.is_employee(auth.uid()));

DROP POLICY IF EXISTS "Users and employees can insert CVs" ON public.cvs;
CREATE POLICY "Users and employees can insert CVs" 
ON public.cvs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR public.is_employee(auth.uid()));

DROP POLICY IF EXISTS "Users and employees can update CVs" ON public.cvs;
CREATE POLICY "Users and employees can update CVs" 
ON public.cvs 
FOR UPDATE 
USING (auth.uid() = user_id OR public.is_employee(auth.uid()));

DROP POLICY IF EXISTS "Users and employees can delete CVs" ON public.cvs;
CREATE POLICY "Users and employees can delete CVs" 
ON public.cvs 
FOR DELETE 
USING (auth.uid() = user_id OR public.is_employee(auth.uid()));

-- Grant necessary permissions
GRANT ALL ON public.cvs TO authenticated;
GRANT ALL ON public.cvs TO service_role;
