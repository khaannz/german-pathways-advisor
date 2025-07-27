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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RotateCcw, Trash2 } from "lucide-react";

const sopSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  nationality: z.string().min(2, "Nationality is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  linked_in: z.string().optional().refine((val) => !val || val === "" || z.string().url().safeParse(val).success, {
    message: "Please enter a valid LinkedIn URL or leave empty"
  }),
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
        duration: 5000,
      });

      loadExistingResponse();
    } catch (error) {
      console.error("Error saving SOP:", error);
      toast({
        title: "Error",
        description: "Failed to save Statement of Purpose. Please try again.",
        variant: "destructive",
        duration: 7000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    form.reset({
      full_name: "",
      email: "",
      phone: "",
      date_of_birth: undefined,
      nationality: "",
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
        .from("sop_responses")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "SOP form deleted successfully!",
        duration: 5000,
      });

      setExistingResponse(null);
      handleClearForm();
    } catch (error) {
      console.error("Error deleting SOP:", error);
      toast({
        title: "Error",
        description: "Failed to delete SOP form. Please try again.",
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
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name as on passport" {...field} />
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
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
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
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="+49 123 456 7890 or +91 98765 43210" {...field} />
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
                    <FormLabel>Nationality *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Indian, German, American" {...field} />
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
                      <Input placeholder="https://linkedin.com/in/yourprofile (leave empty if none)" {...field} />
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
                    <FormLabel>Current Education Status * (min 15 characters)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Example: I am currently completing my Bachelor's degree in Computer Science at Delhi University, expecting graduation in May 2024. I have maintained a GPA of 8.5/10 and am particularly interested in artificial intelligence and machine learning."
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
                name="intended_program"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intended Program * (min 15 characters)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Example: I am applying for the Master's in Computer Science program because it aligns perfectly with my background in software development and my career goals in AI research. The program's focus on machine learning and data science matches my interests."
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
                name="target_universities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Universities * (min 15 characters)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Example: Technical University of Munich (TUM) - MS Computer Science, RWTH Aachen - MS Data Science, University of Stuttgart - MS Software Engineering. I chose these universities for their strong research programs and industry connections."
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

            {/* Motivation */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="why_this_program"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why This Program? * (min 20 characters)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Example: This program offers the perfect blend of theoretical knowledge and practical application in computer science. The curriculum includes courses in machine learning, distributed systems, and software architecture that directly align with my career goals in developing intelligent systems."
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
                name="why_germany"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why Germany? * (min 20 characters)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Example: Germany is a global leader in technology and engineering with a strong emphasis on research and innovation. The country offers excellent educational opportunities, particularly in STEM fields, and has a thriving tech industry with companies like SAP and Siemens."
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
            </div>

            {/* Goals */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="short_term_goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short-term Goals * (min 20 characters)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Example: Upon completing my Master's degree, I plan to work as a software engineer at a leading tech company in Germany, focusing on developing AI-powered applications. I aim to gain 2-3 years of industry experience while continuing to learn about emerging technologies."
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
                name="long_term_goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Long-term Goals * (min 20 characters)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Example: In the long term, I aspire to become a technical lead or architect, eventually starting my own AI-focused company. I want to contribute to breakthrough research in machine learning and develop solutions that can make a positive impact on society."
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
                        placeholder="Example: I completed my Bachelor's thesis on 'Deep Learning for Image Recognition' under Prof. Smith's guidance. The project involved developing a CNN model that achieved 95% accuracy in classifying medical images. This research sparked my interest in AI applications in healthcare."
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
                    <FormLabel>Academic Projects * (min 20 characters)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Example: 1) E-commerce website using React and Node.js with payment integration 2) Machine learning model for stock price prediction using Python and TensorFlow 3) Mobile app for task management built with Flutter. Each project helped me develop both technical and problem-solving skills."
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
                name="work_experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Experience * (min 15 characters)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Example: Software Engineering Intern at TechCorp (6 months) - Developed REST APIs using Java Spring Boot, worked with databases, and collaborated with senior developers on feature development. Gained experience in agile methodology and version control."
                        className="min-h-[120px]"
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

            {/* Personal Qualities */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="personal_qualities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Qualities * (min 20 characters)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Example: I am a dedicated and curious learner who thrives on solving complex problems. My strong analytical skills, combined with excellent communication abilities, enable me to work effectively in team environments. I am also highly adaptable and embrace new challenges."
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
                name="challenges_accomplishments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Challenges & Accomplishments * (min 20 characters)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Example: I overcame financial constraints to fund my education by working part-time while maintaining academic excellence. I also led my university's coding team to victory in a national hackathon, which taught me valuable leadership and time management skills."
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
            </div>

            <div className="flex flex-wrap gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : existingResponse ? "Update SOP" : "Save SOP"}
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
                        This action cannot be undone. This will permanently delete your SOP form data.
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
      </CardContent>
    </Card>
  );
}