-- Add view_link columns to questionnaire response tables
ALTER TABLE public.cv_responses ADD COLUMN view_link TEXT;
ALTER TABLE public.sop_responses ADD COLUMN view_link TEXT;
ALTER TABLE public.lor_responses ADD COLUMN view_link TEXT;

-- Add comments to explain the purpose
COMMENT ON COLUMN public.cv_responses.view_link IS 'Link to view the generated CV document, set by employees';
COMMENT ON COLUMN public.sop_responses.view_link IS 'Link to view the generated SOP document, set by employees';
COMMENT ON COLUMN public.lor_responses.view_link IS 'Link to view the generated LOR document, set by employees';

-- Update RLS policies to allow employees to update view_link
CREATE POLICY "Employees can update view links on CV responses" 
ON public.cv_responses 
FOR UPDATE 
USING (is_employee(auth.uid()))
WITH CHECK (is_employee(auth.uid()));

CREATE POLICY "Employees can update view links on SOP responses" 
ON public.sop_responses 
FOR UPDATE 
USING (is_employee(auth.uid()))
WITH CHECK (is_employee(auth.uid()));

CREATE POLICY "Employees can update view links on LOR responses" 
ON public.lor_responses 
FOR UPDATE 
USING (is_employee(auth.uid()))
WITH CHECK (is_employee(auth.uid()));
