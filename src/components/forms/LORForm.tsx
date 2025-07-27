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
        duration: 5000,
      });

      loadExistingResponse();
    } catch (error) {
      console.error("Error saving LOR:", error);
      toast({
        title: "Error",
        description: "Failed to save Letter of Recommendation information. Please try again.",
        variant: "destructive",
        duration: 7000,
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
                    <FormLabel>Recommender Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. John Smith or Prof. Jane Doe" {...field} />
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
                    <FormLabel>Designation/Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Associate Professor, Senior Manager, Director" {...field} />
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
                    <FormLabel>Institution/Organization *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., MIT, Google Inc., Delhi University" {...field} />
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
                    <FormLabel>Recommender Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="professor.email@university.edu" {...field} />
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
                    <FormLabel>Relationship Type * (min 15 characters)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Example: Dr. Smith was my professor for Advanced Algorithms and Data Structures. He also supervised my final year project on machine learning applications. Our relationship is primarily academic, where he has observed my problem-solving skills and research capabilities."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      {field.value?.length || 0}/15 characters minimum
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="relationship_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration of Relationship * (min 15 characters)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Example: I have known Prof. Smith for 2 years (2022-2024). I took two courses with him in my 6th and 7th semesters, and he supervised my 6-month capstone project. During this time, he closely observed my academic progress and research abilities."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      {field.value?.length || 0}/15 characters minimum
                    </div>
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
                    <FormLabel>Courses/Projects Together * (min 20 characters)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Example: I completed 'Advanced Algorithms' (scored A-) and 'Machine Learning' (scored A) under Prof. Smith. For my capstone project, I developed a recommendation system using collaborative filtering. He guided me through the research methodology and helped refine my approach when I faced challenges with data preprocessing."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      {field.value?.length || 0}/20 characters minimum
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="key_strengths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Strengths They Can Highlight * (min 20 characters)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Example: Prof. Smith can highlight my analytical thinking, problem-solving approach, and ability to work independently on complex projects. He has seen my curiosity in asking thoughtful questions during lectures and my persistence in debugging code during project work. He can also speak to my communication skills during presentations."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      {field.value?.length || 0}/20 characters minimum
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specific_examples"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specific Examples/Achievements * (min 20 characters)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Example: During my capstone project, I successfully improved the accuracy of the recommendation system from 75% to 89% by implementing a hybrid approach. Prof. Smith witnessed my presentation to a panel of industry experts where I clearly explained complex algorithms. He also saw me help struggling classmates understand difficult concepts."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      {field.value?.length || 0}/20 characters minimum
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="grades_performance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic/Work Performance * (min 15 characters)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Example: I consistently ranked in the top 10% of both his classes. He gave me positive feedback on my assignments, particularly praising my code quality and documentation. In his feedback for my project, he mentioned my 'exceptional attention to detail and innovative approach to problem-solving.'"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      {field.value?.length || 0}/15 characters minimum
                    </div>
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