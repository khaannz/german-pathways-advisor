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
import { Save, GraduationCap } from "lucide-react";
import { useFormManager } from "@/hooks/use-form-manager";

const formSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(1, "Phone number is required"),
  academic_background: z.string().min(1, "Academic background is required"),
  preferred_field: z.string().min(1, "Preferred field of study is required"),
  budget_range: z.string().min(1, "Budget range is required"),
  location_preference: z.string().min(1, "Location preference is required"),
  language_requirements: z.string().min(1, "Language requirements are required"),
  specific_requirements: z.string().min(1, "Specific requirements are required"),
  gpa_score: z.string().min(1, "GPA/Grade information is required"),
  test_scores: z.string().optional(),
  work_experience: z.string().optional(),
  research_interests: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

export const UniversityShortlistingFormEnhanced = () => {
  const [loading, setLoading] = useState(false);
  const [existingData, setExistingData] = useState<FormValues | null>(null);
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      academic_background: "",
      preferred_field: "",
      budget_range: "",
      location_preference: "",
      language_requirements: "",
      specific_requirements: "",
      gpa_score: "",
      test_scores: "",
      work_experience: "",
      research_interests: ""
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
          .from('university_shortlisting_responses')
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
          .from('university_shortlisting_responses')
          .update(formData)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('university_shortlisting_responses')
          .insert([formData]);

        if (error) throw error;
        setExistingData(data);
      }

      if (showToast) {
        toast.success("University shortlisting form saved successfully!");
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
            <GraduationCap className="h-6 w-6 text-primary" />
            <CardTitle>University Shortlisting Information</CardTitle>
          </div>
          <CardDescription>
            Help us find the perfect German universities for your academic goals
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
                      <FormLabel>Full Name</FormLabel>
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
                name="academic_background"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Background</FormLabel>
                    <FormDescription>
                      Describe your current/completed education and qualifications
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="Detail your educational background, degrees, institutions..."
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="preferred_field"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Field of Study</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Computer Science, Engineering, Business" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget_range"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Range (Annual)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., €10,000 - €15,000 per year" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location_preference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location Preference</FormLabel>
                    <FormDescription>
                      Specify your preferred cities or regions in Germany
                    </FormDescription>
                    <FormControl>
                      <Input placeholder="e.g., Berlin, Munich, Hamburg, or any specific preferences" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language_requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language Requirements</FormLabel>
                    <FormDescription>
                      Your current language proficiency and preferred language of instruction
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="Detail your German/English proficiency, test scores, preferred language of instruction..."
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
                name="gpa_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GPA/Grade Information</FormLabel>
                    <FormDescription>
                      Your academic performance and grading system
                    </FormDescription>
                    <FormControl>
                      <Input placeholder="e.g., 3.8/4.0 GPA, First Class, 85%" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specific_requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specific Requirements</FormLabel>
                    <FormDescription>
                      Any specific requirements or preferences for your program/university
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="Mention any specific requirements like research opportunities, internships, scholarships, etc..."
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
                name="test_scores"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Scores (Optional)</FormLabel>
                    <FormDescription>
                      Standardized test scores if applicable (GRE, GMAT, etc.)
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="List any standardized test scores (GRE, GMAT, SAT, etc.)..."
                        rows={2}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="work_experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Experience (Optional)</FormLabel>
                    <FormDescription>
                      Relevant professional experience
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe any relevant work experience or internships..."
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
                name="research_interests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Research Interests (Optional)</FormLabel>
                    <FormDescription>
                      Specific research areas or academic interests
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your research interests or specific academic focus areas..."
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
                {loading ? "Saving..." : "Save University Shortlisting Information"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};