import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Plane } from "lucide-react";
import { useFormManager } from "@/hooks/use-form-manager";

const formSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(1, "Phone number is required"),
  nationality: z.string().min(1, "Nationality is required"),
  passport_number: z.string().min(1, "Passport number is required"),
  intended_program: z.string().min(1, "Intended program is required"),
  university_name: z.string().min(1, "University name is required"),
  program_duration: z.string().min(1, "Program duration is required"),
  academic_background: z.string().min(1, "Academic background is required"),
  language_proficiency: z.string().min(1, "Language proficiency details are required"),
  financial_proof: z.string().min(1, "Financial proof details are required"),
  accommodation_plans: z.string().min(1, "Accommodation plans are required"),
  motivation_reasons: z.string().min(1, "Motivation reasons are required"),
  future_plans_germany: z.string().min(1, "Future plans in Germany are required"),
  additional_documents: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

export const VisaMotivationFormEnhanced = () => {
  const [loading, setLoading] = useState(false);
  const [existingData, setExistingData] = useState<FormValues | null>(null);
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      nationality: "",
      passport_number: "",
      intended_program: "",
      university_name: "",
      program_duration: "",
      academic_background: "",
      language_proficiency: "",
      financial_proof: "",
      accommodation_plans: "",
      motivation_reasons: "",
      future_plans_germany: "",
      additional_documents: ""
    }
  });

  const { progress, isAutoSaving, lastSaved } = useFormManager(form, {
    autoSaveDelay: 3000,
    onAutoSave: async (data) => {
      if (user) {
        await saveFormData(data, false);
      }
    }
  });

  useEffect(() => {
    const fetchExistingData = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('visa_motivation_responses')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data && !error) {
          setExistingData(data);
          form.reset(data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchExistingData();
  }, [user, form]);

  const saveFormData = async (data: FormValues, showToast = true) => {
    if (!user) return;

    try {
      const formData = {
        ...data,
        user_id: user.id
      };

      if (existingData) {
        const { error } = await supabase
          .from('visa_motivation_responses')
          .update(formData)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('visa_motivation_responses')
          .insert([formData]);

        if (error) throw error;
        setExistingData(data);
      }

      if (showToast) {
        toast.success("Visa motivation form saved successfully!");
      }
    } catch (error) {
      console.error('Error saving form:', error);
      if (showToast) {
        toast.error("Failed to save form. Please try again.");
      }
    }
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    await saveFormData(data);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Plane className="h-6 w-6 text-primary" />
            <CardTitle>Letter of Motivation for German Student Visa</CardTitle>
          </div>
          <CardDescription>
            Provide information for your German student visa motivation letter
          </CardDescription>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Form Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
            {isAutoSaving && (
              <p className="text-xs text-muted-foreground">Auto-saving...</p>
            )}
            {lastSaved && (
              <p className="text-xs text-muted-foreground">
                Last saved: {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name (as in passport)</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+49 xxx xxxx xxxx" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nationality</FormLabel>
                      <FormControl>
                        <Input placeholder="Your nationality" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passport_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passport Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Passport number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="intended_program"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intended Program</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Master of Science in Computer Science" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="university_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>University Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Name of the German university" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="program_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2 years (4 semesters)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="academic_background"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Background</FormLabel>
                    <FormDescription>
                      Describe your educational qualifications and relevant coursework
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="Detail your academic background, degrees, and relevant subjects..."
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language_proficiency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language Proficiency</FormLabel>
                    <FormDescription>
                      Detail your German and English language skills with test scores if available
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="List your language certificates (IELTS, TOEFL, TestDaF, DSH, etc.) with scores..."
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="financial_proof"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Financial Proof</FormLabel>
                    <FormDescription>
                      Describe how you will finance your studies and living expenses in Germany
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="Detail your financial arrangements (blocked account, scholarship, family support, etc.)..."
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accommodation_plans"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accommodation Plans</FormLabel>
                    <FormDescription>
                      Describe your housing arrangements in Germany
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="Explain your accommodation plans (student dormitory, private housing, etc.)..."
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="motivation_reasons"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivation for Studying in Germany</FormLabel>
                    <FormDescription>
                      Explain why you chose Germany and this specific program
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your motivation for choosing Germany and this program..."
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="future_plans_germany"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Future Plans After Studies</FormLabel>
                    <FormDescription>
                      Describe your career plans after completing your studies
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="Explain your future career plans and how this program fits your goals..."
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additional_documents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Documents & Information (Optional)</FormLabel>
                    <FormDescription>
                      Any other relevant information or documents you want to mention
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="Mention any additional supporting documents or information..."
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={loading} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Visa Motivation Information"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};