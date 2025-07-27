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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthContext";

const lorSchema = z.object({
  recommender_name: z.string().min(2, "Recommender name is required"),
  recommender_designation: z.string().min(2, "Designation is required"),
  recommender_institution: z.string().min(2, "Institution is required"),
  recommender_email: z.string().email("Valid email is required"),
  relationship_type: z.string().min(15, "Please provide at least 15 characters"),
  relationship_duration: z.string().min(15, "Please provide at least 15 characters"),
  courses_projects: z.string().min(20, "Please provide at least 20 characters"),
  key_strengths: z.string().min(20, "Please provide at least 20 characters"),
  specific_examples: z.string().min(20, "Please provide at least 20 characters"),
  grades_performance: z.string().min(15, "Please provide at least 15 characters"),
});

type LORFormData = z.infer<typeof lorSchema>;

export function LORForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [existingResponse, setExistingResponse] = useState<LORFormData | null>(null);

  const form = useForm<LORFormData>({
    resolver: zodResolver(lorSchema),
    defaultValues: {
      recommender_name: "",
      recommender_designation: "",
      recommender_institution: "",
      recommender_email: "",
      relationship_type: "",
      relationship_duration: "",
      courses_projects: "",
      key_strengths: "",
      specific_examples: "",
      grades_performance: "",
    },
  });

  useEffect(() => {
    if (user) {
      loadExistingResponse();
    }
  }, [user]);

  const loadExistingResponse = async () => {
    try {
      const { data, error } = await supabase
        .from("lor_responses")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setExistingResponse(data);
        form.reset({
          recommender_name: data.recommender_name || "",
          recommender_designation: data.recommender_designation || "",
          recommender_institution: data.recommender_institution || "",
          recommender_email: data.recommender_email || "",
          relationship_type: data.relationship_type || "",
          relationship_duration: data.relationship_duration || "",
          courses_projects: data.courses_projects || "",
          key_strengths: data.key_strengths || "",
          specific_examples: data.specific_examples || "",
          grades_performance: data.grades_performance || "",
        });
      }
    } catch (error) {
      console.error("Error loading LOR response:", error);
    }
  };

  const onSubmit = async (data: LORFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      const lorData = {
        user_id: user.id,
        ...data,
      };

      if (existingResponse) {
        const { error } = await supabase
          .from("lor_responses")
          .update(lorData)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("lor_responses")
          .insert(lorData);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Letter of Recommendation information saved successfully!",
      });

      loadExistingResponse();
    } catch (error) {
      console.error("Error saving LOR:", error);
      toast({
        title: "Error",
        description: "Failed to save Letter of Recommendation information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Letter of Recommendation</CardTitle>
        <CardDescription>
          Provide information about your recommender and your relationship with them
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Recommender Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="recommender_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recommender Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="recommender_designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation/Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Professor, Manager, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="recommender_institution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution/Organization</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="recommender_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recommender Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Relationship Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="relationship_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship Type</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your relationship with the recommender (e.g., student-teacher, employee-supervisor)..."
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
                name="relationship_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration of Relationship</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="How long have you known this person and in what capacity?"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Academic/Professional Context */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="courses_projects"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Courses/Projects Together</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe courses, projects, or work you've done with this recommender..."
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
                name="key_strengths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Strengths They Can Highlight</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What specific strengths or qualities can this person highlight about you?"
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
                name="specific_examples"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specific Examples/Achievements</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide specific examples or achievements they witnessed or were involved in..."
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
                name="grades_performance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic/Work Performance</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your performance in their class/under their supervision (grades, feedback, etc.)..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : existingResponse ? "Update LOR Info" : "Save LOR Info"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}