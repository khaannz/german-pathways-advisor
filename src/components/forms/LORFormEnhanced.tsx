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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RotateCcw, Trash2, Save, Clock, CheckCircle, Mail, User, Building, Award } from "lucide-react";

// Enhanced validation schema
const lorSchema = z.object({
  recommender_name: z.string().min(2, "Recommender name is required"),
  recommender_designation: z.string().min(2, "Designation is required"),
  recommender_institution: z.string().min(2, "Institution is required"),
  recommender_email: z.string().email("Valid email is required"),
  recommender_phone: z.string().optional(),
  relationship_type: z.string().min(15, "Please provide at least 15 characters"),
  relationship_duration: z.string().min(15, "Please provide at least 15 characters"),
  courses_projects: z.string().min(20, "Please provide at least 20 characters"),
  key_strengths: z.string().min(20, "Please provide at least 20 characters"),
  specific_examples: z.string().min(20, "Please provide at least 20 characters"),
  grades_performance: z.string().min(15, "Please provide at least 15 characters"),
  research_experience: z.string().min(15, "Please provide at least 15 characters"),
  leadership_roles: z.string().min(15, "Please provide at least 15 characters"),
  communication_skills: z.string().min(15, "Please provide at least 15 characters"),
  recommendation_strength: z.enum(["strong", "moderate", "weak"], {
    message: "Please select the strength of recommendation",
  }),
});

type LORFormData = z.infer<typeof lorSchema>;

export function LORFormEnhanced() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [existingResponse, setExistingResponse] = useState<Partial<LORFormData> | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionDate, setSubmissionDate] = useState<string | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [progress, setProgress] = useState(0);

  const form = useForm<LORFormData>({
    resolver: zodResolver(lorSchema),
    mode: "onChange",
    defaultValues: {
      recommender_name: "",
      recommender_designation: "",
      recommender_institution: "",
      recommender_email: "",
      recommender_phone: "",
      relationship_type: "",
      relationship_duration: "",
      courses_projects: "",
      key_strengths: "",
      specific_examples: "",
      grades_performance: "",
      research_experience: "",
      leadership_roles: "",
      communication_skills: "",
      recommendation_strength: "moderate",
    },
  });

  // Calculate form completion progress
  const calculateProgress = useCallback(() => {
    const values = form.getValues();
    const totalFields = 14; // All required fields
    let completedFields = 0;

    if (values.recommender_name && values.recommender_name.length >= 2) completedFields++;
    if (values.recommender_designation && values.recommender_designation.length >= 2) completedFields++;
    if (values.recommender_institution && values.recommender_institution.length >= 2) completedFields++;
    if (values.recommender_email && values.recommender_email.includes('@')) completedFields++;
    if (values.relationship_type && values.relationship_type.length >= 15) completedFields++;
    if (values.relationship_duration && values.relationship_duration.length >= 15) completedFields++;
    if (values.courses_projects && values.courses_projects.length >= 20) completedFields++;
    if (values.key_strengths && values.key_strengths.length >= 20) completedFields++;
    if (values.specific_examples && values.specific_examples.length >= 20) completedFields++;
    if (values.grades_performance && values.grades_performance.length >= 15) completedFields++;
    if (values.research_experience && values.research_experience.length >= 15) completedFields++;
    if (values.leadership_roles && values.leadership_roles.length >= 15) completedFields++;
    if (values.communication_skills && values.communication_skills.length >= 15) completedFields++;
    if (values.recommendation_strength) completedFields++;

    setProgress((completedFields / totalFields) * 100);
  }, [form]);

  // Auto-save functionality
  const autoSave = useCallback(async (data: LORFormData) => {
    if (!user || isAutoSaving || loading || isSubmitted) return;
    
    setIsAutoSaving(true);
    try {
      const lorData = {
        user_id: user.id,
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("lor_responses")
        .upsert(lorData, { onConflict: 'user_id' });

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
  }, [form.watch(), form.formState.isDirty, form.formState.isSubmitting, autoSave, isSubmitted]);

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
        .from("lor_responses")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setExistingResponse(data as any);
        if (setSubmittedStatus) {
          setIsSubmitted(true);
        }
        
        if (data.created_at) {
          setSubmissionDate(data.created_at);
        }
        
        form.reset({
          recommender_name: data.recommender_name || "",
          recommender_designation: data.recommender_designation || "",
          recommender_institution: data.recommender_institution || "",
          recommender_email: data.recommender_email || "",
          recommender_phone: data.recommender_phone || "",
          relationship_type: data.relationship_type || "",
          relationship_duration: data.relationship_duration || "",
          courses_projects: data.courses_projects || "",
          key_strengths: data.key_strengths || "",
          specific_examples: data.specific_examples || "",
          grades_performance: data.grades_performance || "",
          research_experience: data.research_experience || "",
          leadership_roles: data.leadership_roles || "",
          communication_skills: data.communication_skills || "",
          recommendation_strength: ((["strong","moderate","weak"] as const).includes((data.recommendation_strength as any))) ? (data.recommendation_strength as "strong"|"moderate"|"weak") : "moderate",
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
      setLastSaved(new Date());
      loadExistingResponse(false);
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
      recommender_phone: "",
      relationship_type: "",
      relationship_duration: "",
      courses_projects: "",
      key_strengths: "",
      specific_examples: "",
      grades_performance: "",
      research_experience: "",
      leadership_roles: "",
      communication_skills: "",
      recommendation_strength: "moderate",
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Enhanced Letter of Recommendation</CardTitle>
            <CardDescription>
              Provide comprehensive information about your recommender and relationship
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
              {/* Recommender Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Recommender Information</h3>
                </div>
                
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
                  <FormField
                    control={form.control}
                    name="recommender_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 234 567 8900" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="recommendation_strength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Strength of Recommendation *</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="strong">Strong Recommendation</option>
                            <option value="moderate">Moderate Recommendation</option>
                            <option value="weak">Weak Recommendation</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Relationship Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Building className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold">Relationship Details</h3>
                </div>
                
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
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold">Academic & Professional Context</h3>
                </div>
                
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
              </div>

              {/* Performance & Skills */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold">Performance & Skills Assessment</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <FormField
                    control={form.control}
                    name="research_experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Research Experience * (min 15 characters)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Example: I worked on a research project under Prof. Smith's guidance, where I developed a novel algorithm for data clustering. He observed my research methodology, literature review skills, and ability to present findings at departmental seminars."
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
                    name="leadership_roles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leadership Roles * (min 15 characters)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Example: I served as a teaching assistant for Prof. Smith's course, where I led tutorial sessions and mentored junior students. He observed my leadership skills in organizing study groups and coordinating team projects."
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
                    name="communication_skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Communication Skills * (min 15 characters)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Example: Prof. Smith has seen me present complex technical concepts clearly to diverse audiences. He observed my ability to write comprehensive reports and communicate effectively in team settings during group projects."
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
                      {existingResponse ? "Update LOR" : "Save LOR"}
                    </>
                  )}
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