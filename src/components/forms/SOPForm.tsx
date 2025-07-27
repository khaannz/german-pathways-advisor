import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthContext";

const sopSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  nationality: z.string().min(2, "Nationality is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  linked_in: z.string().url("Valid LinkedIn URL is required").optional().or(z.literal("")),
  current_education_status: z.string().min(15, "Please provide at least 15 characters"),
  intended_program: z.string().min(15, "Please provide at least 15 characters"),
  target_universities: z.string().min(15, "Please provide at least 15 characters"),
  why_this_program: z.string().min(20, "Please provide at least 20 characters"),
  why_germany: z.string().min(20, "Please provide at least 20 characters"),
  short_term_goals: z.string().min(20, "Please provide at least 20 characters"),
  long_term_goals: z.string().min(20, "Please provide at least 20 characters"),
  has_thesis: z.boolean(),
  thesis_details: z.string().optional(),
  academic_projects: z.string().min(20, "Please provide at least 20 characters"),
  work_experience: z.string().min(15, "Please provide at least 15 characters"),
  personal_qualities: z.string().min(20, "Please provide at least 20 characters"),
  challenges_accomplishments: z.string().min(20, "Please provide at least 20 characters"),
});

type SOPFormData = z.infer<typeof sopSchema>;

export function SOPForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [existingResponse, setExistingResponse] = useState<SOPFormData | null>(null);

  const form = useForm<SOPFormData>({
    resolver: zodResolver(sopSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      nationality: "",
      date_of_birth: "",
      linked_in: "",
      current_education_status: "",
      intended_program: "",
      target_universities: "",
      why_this_program: "",
      why_germany: "",
      short_term_goals: "",
      long_term_goals: "",
      has_thesis: false,
      thesis_details: "",
      academic_projects: "",
      work_experience: "",
      personal_qualities: "",
      challenges_accomplishments: "",
    },
  });

  const hasThesis = form.watch("has_thesis");

  useEffect(() => {
    if (user) {
      loadExistingResponse();
    }
  }, [user]);

  const loadExistingResponse = async () => {
    try {
      const { data, error } = await supabase
        .from("sop_responses")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setExistingResponse(data);
        form.reset({
          full_name: data.full_name || "",
          email: data.email || "",
          phone: data.phone || "",
          nationality: data.nationality || "",
          date_of_birth: data.date_of_birth || "",
          linked_in: data.linked_in || "",
          current_education_status: data.current_education_status || "",
          intended_program: data.intended_program || "",
          target_universities: data.target_universities || "",
          why_this_program: data.why_this_program || "",
          why_germany: data.why_germany || "",
          short_term_goals: data.short_term_goals || "",
          long_term_goals: data.long_term_goals || "",
          has_thesis: data.has_thesis || false,
          thesis_details: data.thesis_details || "",
          academic_projects: data.academic_projects || "",
          work_experience: data.work_experience || "",
          personal_qualities: data.personal_qualities || "",
          challenges_accomplishments: data.challenges_accomplishments || "",
        });
      }
    } catch (error) {
      console.error("Error loading SOP response:", error);
    }
  };

  const onSubmit = async (data: SOPFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      const sopData = {
        user_id: user.id,
        ...data,
      };

      if (existingResponse) {
        const { error } = await supabase
          .from("sop_responses")
          .update(sopData)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("sop_responses")
          .insert(sopData);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Statement of Purpose saved successfully!",
      });

      loadExistingResponse();
    } catch (error) {
      console.error("Error saving SOP:", error);
      toast({
        title: "Error",
        description: "Failed to save Statement of Purpose. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statement of Purpose</CardTitle>
        <CardDescription>
          Provide information for your Statement of Purpose document
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="linked_in"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn Profile (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/in/yourprofile" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Academic Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="current_education_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Education Status</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your current educational status..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="intended_program"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intended Program</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What program are you applying for and why?"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="target_universities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Universities</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List your target universities and programs..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Motivation */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="why_this_program"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why This Program?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Explain why you chose this specific program..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="why_germany"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why Germany?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Why did you choose Germany for your studies?"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Goals */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="short_term_goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short-term Goals</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What are your short-term career goals?"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="long_term_goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Long-term Goals</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What are your long-term career aspirations?"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Research Experience */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="has_thesis"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>I have thesis/research experience</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              {hasThesis && (
                <FormField
                  control={form.control}
                  name="thesis_details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thesis/Research Details</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your thesis or research experience..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Experience */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="academic_projects"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Projects</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your relevant academic projects..."
                        className="min-h-[120px]"
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
                    <FormLabel>Work Experience</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your relevant work experience..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Personal Qualities */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="personal_qualities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Qualities</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What personal qualities make you a good candidate?"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="challenges_accomplishments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Challenges & Accomplishments</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe significant challenges you've overcome and accomplishments..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : existingResponse ? "Update SOP" : "Save SOP"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}