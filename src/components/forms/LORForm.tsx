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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RotateCcw, Trash2 } from "lucide-react";

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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionDate, setSubmissionDate] = useState<string | null>(null);

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
      loadExistingResponse(true); // Set isSubmitted to true on initial load
    }
  }, [user]);

  const loadExistingResponse = async (setSubmittedStatus = false) => {
    try {
      const { data, error } = await supabase
        .from("lor_responses")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setExistingResponse(data);
        // Set submitted status based on parameter
        if (setSubmittedStatus) {
          setIsSubmitted(true);
        }
        
        // Store submission date
        if (data.created_at) {
          setSubmissionDate(data.created_at);
        }
        
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

      setIsSubmitted(true);
      loadExistingResponse(false); // Don't override isSubmitted since we just set it
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

  const handleClearForm = () => {
    form.reset({
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
    });
    toast({
      title: "Form cleared",
      description: "All form fields have been reset to default values.",
      duration: 3000,
    });
  };

  const handleDeleteForm = async () => {
    if (!user || !existingResponse) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("lor_responses")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "LOR form deleted successfully!",
        duration: 5000,
      });

      setExistingResponse(null);
      handleClearForm();
    } catch (error) {
      console.error("Error deleting LOR:", error);
      toast({
        title: "Error",
        description: "Failed to delete LOR form. Please try again.",
        variant: "destructive",
        duration: 5000,
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
        {isSubmitted ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">LOR Form Submitted!</h3>
                <p className="text-gray-600 mb-4">
                  Your Letter of Recommendation information has been successfully submitted and is being processed by our team.
                </p>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Form Submitted Successfully</h4>
                  <p className="text-sm text-green-700">
                    Thank you for submitting your LOR information. Our team will review your details and get back to you soon.
                  </p>
                  {submissionDate && (
                    <p className="text-xs text-green-600 mt-2">
                      Submitted on: {new Date(submissionDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                
                <div className="flex justify-center gap-4 pt-4 border-t mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsSubmitted(false);
                      // Reset form to allow editing while keeping existing data
                      if (existingResponse) {
                        loadExistingResponse(false); // Don't set isSubmitted to true
                      }
                    }}
                    className="text-gray-600"
                  >
                    Edit Submission
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
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

            <div className="flex flex-wrap gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : existingResponse ? "Update LOR" : "Save LOR"}
              </Button>
              
              <Button type="button" variant="outline" onClick={handleClearForm}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear Form
              </Button>
              
              {existingResponse && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Form
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your LOR form data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteForm} disabled={loading}>
                        {loading ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </form>
        </Form>
        )}
      </CardContent>
    </Card>
  );
}