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
import { Save, FileText } from "lucide-react";
import { useFormManager } from "@/hooks/use-form-manager";

const formSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(1, "Phone number is required"),
  target_position: z.string().min(1, "Target position is required"),
  target_company: z.string().min(1, "Target company is required"),
  relevant_experience: z.string().min(1, "Please describe your relevant experience"),
  key_achievements: z.string().min(1, "Please list your key achievements"),
  why_interested: z.string().min(1, "Please explain why you're interested"),
  skills_match: z.string().min(1, "Please describe how your skills match"),
  additional_info: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

export const CoverLetterFormEnhanced = () => {
  const [loading, setLoading] = useState(false);
  const [existingData, setExistingData] = useState<FormValues | null>(null);
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      target_position: "",
      target_company: "",
      relevant_experience: "",
      key_achievements: "",
      why_interested: "",
      skills_match: "",
      additional_info: ""
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
          .from('cover_letter_responses')
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
          .from('cover_letter_responses')
          .update(formData)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cover_letter_responses')
          .insert([formData]);

        if (error) throw error;
        setExistingData(data);
      }

      if (showToast) {
        toast.success("Cover letter form saved successfully!");
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
            <FileText className="h-6 w-6 text-primary" />
            <CardTitle>Cover Letter Information</CardTitle>
          </div>
          <CardDescription>
            Provide details for your professional cover letter
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

              <div className="grid md:grid-cols-2 gap-4">
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
                  name="target_company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="target_position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Position</FormLabel>
                    <FormControl>
                      <Input placeholder="Position you're applying for" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="relevant_experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relevant Experience</FormLabel>
                    <FormDescription>
                      Describe your relevant work experience and background
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="Share your relevant professional experience..."
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
                name="key_achievements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Achievements</FormLabel>
                    <FormDescription>
                      Highlight your major accomplishments and achievements
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="List your key achievements and accomplishments..."
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
                name="why_interested"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why Are You Interested?</FormLabel>
                    <FormDescription>
                      Explain why you're interested in this position and company
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="Explain your interest in this role and company..."
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
                name="skills_match"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills Match</FormLabel>
                    <FormDescription>
                      Describe how your skills align with the job requirements
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="Explain how your skills match the position requirements..."
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
                name="additional_info"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Information (Optional)</FormLabel>
                    <FormDescription>
                      Any additional information you'd like to include
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional details you'd like to share..."
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
                {loading ? "Saving..." : "Save Cover Letter Information"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};