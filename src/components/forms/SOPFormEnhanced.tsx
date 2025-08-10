import { useState, useEffect, useCallback } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RotateCcw, Trash2, Save, Clock, CheckCircle, User, GraduationCap, Target, Globe, Award, Briefcase } from "lucide-react";

// Enhanced validation schema
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
  research_interests: z.string().min(15, "Please provide at least 15 characters"),
  language_proficiency: z.string().min(15, "Please provide at least 15 characters"),
  financial_planning: z.string().min(15, "Please provide at least 15 characters"),
});

type SOPFormData = z.infer<typeof sopSchema>;

export function SOPFormEnhanced() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [existingResponse, setExistingResponse] = useState<SOPFormData | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionDate, setSubmissionDate] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const form = useForm<SOPFormData>({
    resolver: zodResolver(sopSchema),
    mode: "onChange",
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
      research_interests: "",
      language_proficiency: "",
      financial_planning: "",
    },
  });

  const hasThesis = form.watch("has_thesis");
  const watchedValues = form.watch();

  // Calculate form completion progress
  const calculateProgress = useCallback(() => {
    const values = form.getValues();
    const totalFields = 18; // All required fields
    let completedFields = 0;

    if (values.full_name && values.full_name.length >= 2) completedFields++;
    if (values.email && values.email.includes('@')) completedFields++;
    if (values.phone && values.phone.length >= 10) completedFields++;
    if (values.nationality && values.nationality.length >= 2) completedFields++;
    if (values.date_of_birth && values.date_of_birth.length >= 1) completedFields++;
    if (values.current_education_status && values.current_education_status.length >= 15) completedFields++;
    if (values.intended_program && values.intended_program.length >= 15) completedFields++;
    if (values.target_universities && values.target_universities.length >= 15) completedFields++;
    if (values.why_this_program && values.why_this_program.length >= 20) completedFields++;
    if (values.why_germany && values.why_germany.length >= 20) completedFields++;
    if (values.short_term_goals && values.short_term_goals.length >= 20) completedFields++;
    if (values.long_term_goals && values.long_term_goals.length >= 20) completedFields++;
    if (values.academic_projects && values.academic_projects.length >= 20) completedFields++;
    if (values.work_experience && values.work_experience.length >= 15) completedFields++;
    if (values.personal_qualities && values.personal_qualities.length >= 20) completedFields++;
    if (values.challenges_accomplishments && values.challenges_accomplishments.length >= 20) completedFields++;
    if (values.research_interests && values.research_interests.length >= 15) completedFields++;
    if (values.language_proficiency && values.language_proficiency.length >= 15) completedFields++;
    if (values.financial_planning && values.financial_planning.length >= 15) completedFields++;

    setProgress((completedFields / totalFields) * 100);
  }, [form]);

  // Auto-save functionality
  const autoSave = useCallback(async (data: SOPFormData) => {
    if (!user || isAutoSaving || loading || isSubmitted) return;
    
    setIsAutoSaving(true);
    try {
      const sopData = {
        user_id: user.id,
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("sop_responses")
        .upsert(sopData, { onConflict: 'user_id' });

      if (error) throw error;
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Don't show error toast for auto-save failures to avoid spam
    } finally {
      setIsAutoSaving(false);
    }
  }, [user, isAutoSaving, loading]);

  // Auto-save when form values change (with debounce)
  useEffect(() => {
    if (isSubmitted) return; // Don't auto-save if form is already submitted
    
    const timeoutId = setTimeout(() => {
      if (form.formState.isDirty && !form.formState.isSubmitting) {
        const values = form.getValues();
        autoSave(values);
      }
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [watchedValues, form.formState.isDirty, form.formState.isSubmitting, autoSave, isSubmitted]);

  // Update progress when form changes
  useEffect(() => {
    calculateProgress();
  }, [form.watch(), calculateProgress]);

  useEffect(() => {
    if (user) {
      loadExistingResponse(true);
    }
  }, [user]);

  const loadExistingResponse = async (setSubmittedStatus = false) => {
    try {
      const { data, error } = await supabase
        .from("sop_responses")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setExistingResponse(data);
        if (setSubmittedStatus) {
          setIsSubmitted(true);
        }
        
        if (data.created_at) {
          setSubmissionDate(data.created_at);
        }
        
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
          research_interests: data.research_interests || "",
          language_proficiency: data.language_proficiency || "",
          financial_planning: data.financial_planning || "",
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

      setIsSubmitted(true);
      form.reset(data);
      setLastSaved(new Date());
      loadExistingResponse(false);
    } catch (error: any) {
      console.error("Error saving SOP:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to save Statement of Purpose. Please try again.",
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
      date_of_birth: "",
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
      research_interests: "",
      language_proficiency: "",
      financial_planning: "",
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Statement of Purpose</CardTitle>
            <CardDescription>
              Create a comprehensive SOP with auto-save and progress tracking
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isAutoSaving && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </div>
            )}
            {lastSaved && !isAutoSaving && (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Form Completion</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={progress >= 100 ? "default" : progress >= 75 ? "secondary" : "outline"}>
              {progress >= 100 ? "Complete" : progress >= 75 ? "Almost Done" : "In Progress"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isSubmitted ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">SOP Form Submitted!</h3>
                <p className="text-gray-600 mb-4">
                  Your Statement of Purpose information has been successfully submitted and is being processed by our team.
                </p>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Form Submitted Successfully</h4>
                  <p className="text-sm text-green-700">
                    Thank you for submitting your SOP information. Our team will review your details and get back to you soon.
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
                      if (existingResponse) {
                        loadExistingResponse(false);
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
              {/* Personal Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                </div>
                
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
                        <FormLabel>Date of Birth *</FormLabel>
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
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold">Academic Information</h3>
                </div>
                
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
                <div className="flex items-center gap-2 mb-4">
                  <Target className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold">Motivation & Goals</h3>
                </div>
                
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              {/* Research Experience */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold">Research & Experience</h3>
                </div>
                
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

              {/* Personal Qualities & Additional Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold">Personal Qualities & Additional Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <FormField
                    control={form.control}
                    name="research_interests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Research Interests * (min 15 characters)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Example: My research interests include machine learning, computer vision, and natural language processing. I am particularly interested in developing AI systems that can assist in healthcare diagnostics and improve accessibility for people with disabilities."
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
                    name="language_proficiency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language Proficiency * (min 15 characters)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Example: I am fluent in English (IELTS 7.5), Hindi (native), and have basic knowledge of German (A2 level). I am actively learning German and plan to reach B2 level before starting my studies in Germany."
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
                    name="financial_planning"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Financial Planning * (min 15 characters)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Example: I have secured a scholarship that covers 50% of my tuition fees. I have also saved sufficient funds to cover living expenses for the first year. I plan to work part-time during my studies to supplement my income."
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
              </div>

              <div className="flex flex-wrap gap-4">
                <Button type="submit" disabled={loading || isAutoSaving}>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {existingResponse ? "Update SOP" : "Save SOP"}
                    </>
                  )}
                </Button>
                
                <Button type="button" variant="outline" onClick={handleClearForm} disabled={loading}>
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
        )}
      </CardContent>
    </Card>
  );
} 