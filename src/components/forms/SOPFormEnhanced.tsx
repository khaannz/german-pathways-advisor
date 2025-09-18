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
import { Badge } from "@/components/ui/badge";
import { SOPResponseView } from "@/components/SOPResponseView";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthContext";
import { RotateCcw, Save, Clock, CheckCircle, User, GraduationCap, Target, Globe, Award, Briefcase } from "lucide-react";

interface SOPFormEnhancedProps {
  onCompleted?: () => void;
}

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
  current_education_status: z.string().optional(),
  intended_program: z.string().optional(),
  target_universities: z.string().optional(),
  why_this_program: z.string().optional(),
  why_germany: z.string().optional(),
  short_term_goals: z.string().optional(),
  long_term_goals: z.string().optional(),
  has_thesis: z.boolean(),
  thesis_details: z.string().optional(),
  academic_projects: z.string().optional(),
  work_experience: z.string().optional(),
  personal_qualities: z.string().optional(),
  challenges_accomplishments: z.string().optional(),
  research_interests: z.string().optional(),
  language_proficiency: z.string().optional(),
  financial_planning: z.string().optional(),
});

type SOPFormData = z.infer<typeof sopSchema>;

interface PersistedSOP extends SOPFormData {
  submitted_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

const formatTimestamp = (value: Date | string | null | undefined) => {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;
  return `${date.toLocaleDateString()} - ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

export function SOPFormEnhanced({ onCompleted }: SOPFormEnhancedProps = {}) {
  const { user, isEmployee } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [existingResponse, setExistingResponse] = useState<PersistedSOP | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionDate, setSubmissionDate] = useState<string | null>(null);
  const [viewRefresh, setViewRefresh] = useState(0);
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


  const autoSave = useCallback(
    async (values: SOPFormData) => {
      if (!user || isAutoSaving || loading || (!isEmployee && isSubmitted)) return;

      setIsAutoSaving(true);
      try {
        const payload = {
          user_id: user.id,
          ...values,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from("sop_responses")
          .upsert(payload, { onConflict: "user_id" });

        if (error) throw error;
        setLastSaved(new Date());
      } catch (error) {
        console.error("Auto-save failed:", error);
      } finally {
        setIsAutoSaving(false);
      }
    },
    [user, isAutoSaving, isEmployee, isSubmitted, loading]
  );

  useEffect(() => {
    if (isSubmitted && !isEmployee) return;

    const timeoutId = setTimeout(() => {
      if (form.formState.isDirty && !form.formState.isSubmitting) {
        autoSave(form.getValues());
      }
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [autoSave, form, form.formState.isDirty, form.formState.isSubmitting, form.watch(), isEmployee, isSubmitted]);

  const loadExistingResponse = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("sop_responses")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const persisted = data as PersistedSOP;
        setExistingResponse(persisted);
        setIsSubmitted(Boolean(persisted.submitted_at));
        setSubmissionDate(persisted.submitted_at ?? null);
        setLastSaved(persisted.updated_at ? new Date(persisted.updated_at) : null);

        form.reset({
          full_name: persisted.full_name || "",
          email: persisted.email || "",
          phone: persisted.phone || "",
          nationality: persisted.nationality || "",
          date_of_birth: persisted.date_of_birth || "",
          linked_in: persisted.linked_in || "",
          current_education_status: persisted.current_education_status || "",
          intended_program: persisted.intended_program || "",
          target_universities: persisted.target_universities || "",
          why_this_program: persisted.why_this_program || "",
          why_germany: persisted.why_germany || "",
          short_term_goals: persisted.short_term_goals || "",
          long_term_goals: persisted.long_term_goals || "",
          has_thesis: persisted.has_thesis ?? false,
          thesis_details: persisted.thesis_details || "",
          academic_projects: persisted.academic_projects || "",
          work_experience: persisted.work_experience || "",
          personal_qualities: persisted.personal_qualities || "",
          challenges_accomplishments: persisted.challenges_accomplishments || "",
          research_interests: persisted.research_interests || "",
          language_proficiency: persisted.language_proficiency || "",
          financial_planning: persisted.financial_planning || "",
        });

        setViewRefresh((prev) => prev + 1);
      } else {
        setExistingResponse(null);
        setIsSubmitted(false);
        setSubmissionDate(null);
        setLastSaved(null);
      }
    } catch (error) {
      console.error("Error loading SOP response:", error);
    }
  }, [form, user]);

  useEffect(() => {
    loadExistingResponse();
  }, [loadExistingResponse]);

  const onSubmit = async (data: SOPFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      const sopData = {
        user_id: user.id,
        ...data,
        submitted_at: new Date().toISOString(),
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

      await loadExistingResponse();
      onCompleted?.();
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

  const lastSavedDisplay = formatTimestamp(lastSaved);
  const submissionDisplay = formatTimestamp(submissionDate);
  const lockedView = !isEmployee && isSubmitted;

  if (lockedView) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="space-y-3">
            <Badge variant="secondary" className="w-fit">Submission locked</Badge>
            <CardTitle className="text-2xl">Your SOP responses are locked</CardTitle>
            <CardDescription>
              To make changes, please contact your advisor. The summary below shows your submitted answers.
            </CardDescription>
          </CardHeader>
        </Card>
        <SOPResponseView />
      </div>
    );
  }

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
    setIsSubmitted(false);
    setSubmissionDate(null);
    setLastSaved(null);
    toast({
      title: "Form cleared",
      description: "All form fields have been reset to default values.",
      duration: 3000,
    });
  };

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">Statement of Purpose</CardTitle>
              <CardDescription>
                {isEmployee
                  ? "Collect narrative details to guide SOP drafting."
                  : "Share the story behind your application. Once submitted, updates must go through your advisor."}
              </CardDescription>
            </div>
            <Badge variant={isEmployee ? "outline" : "secondary"} className="h-fit">
              {isEmployee ? "Team editing" : "One-time submission"}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {isAutoSaving && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 animate-spin" />
              Auto-saving
            </Badge>
          )}
          {lastSavedDisplay && !isAutoSaving && (
            <Badge variant="outline">Last saved {lastSavedDisplay}</Badge>
          )}
          {submissionDisplay && (
            <Badge variant="outline">Submitted {submissionDisplay}</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isSubmitted ? (
          <div className="flex flex-col items-center gap-6 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle className="h-8 w-8" />
            </div>
            <div className="max-w-xl space-y-2">
              <h3 className="text-xl font-semibold">SOP submitted</h3>
              <p className="text-sm text-muted-foreground">
                Your Statement of Purpose responses are ready for the writing team. We'll be in touch if we need anything else.
              </p>
              {submissionDisplay && (
                <p className="text-xs text-muted-foreground">Submitted {submissionDisplay}</p>
              )}
            </div>
            {isEmployee && (
              <Button
                variant="outline"
                onClick={() => {
                  setIsSubmitted(false);
                  loadExistingResponse();
                }}
              >
                Edit submission
              </Button>
            )}
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
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
} 























