import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LORResponseView } from "@/components/LORResponseView";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthContext";
import { RotateCcw, Save, Clock, Plus, Trash2, Award, ClipboardList } from "lucide-react";

const strengthValues = ["strong", "moderate", "weak"] as const;

type RecommendationStrength = (typeof strengthValues)[number];

const recommenderSchema = z.object({
  name: z.string().min(2, "Recommender name is required"),
  designation: z.string().min(2, "Designation is required"),
  institution: z.string().min(2, "Institution is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  relationship_type: z.string().optional(),
  relationship_duration: z.string().optional(),
  courses_projects: z.string().optional(),
  key_strengths: z.string().optional(),
  specific_examples: z.string().optional(),
  grades_performance: z.string().optional(),
  research_experience: z.string().optional(),
  leadership_roles: z.string().optional(),
  communication_skills: z.string().optional(),
  recommendation_strength: z.enum(strengthValues),
});

type Recommender = z.infer<typeof recommenderSchema>;

const blankRecommender: Recommender = {
  name: "",
  designation: "",
  institution: "",
  email: "",
  phone: "",
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
};

const lorSchema = z.object({
  recommenders: z.array(recommenderSchema).min(1, "Add at least one recommender"),
});

type LORFormData = z.infer<typeof lorSchema>;

type PersistedLOR = {
  created_at?: string | null;
  updated_at?: string | null;
  recommenders?: Recommender[] | null;
  recommender_name?: string | null;
  recommender_designation?: string | null;
  recommender_institution?: string | null;
  recommender_email?: string | null;
  recommender_phone?: string | null;
  relationship_type?: string | null;
  relationship_duration?: string | null;
  courses_projects?: string | null;
  key_strengths?: string | null;
  specific_examples?: string | null;
  grades_performance?: string | null;
  research_experience?: string | null;
  leadership_roles?: string | null;
  communication_skills?: string | null;
  recommendation_strength?: RecommendationStrength | null;
};

const coerceStrength = (value: unknown): RecommendationStrength =>
  strengthValues.includes(value as RecommendationStrength)
    ? (value as RecommendationStrength)
    : "moderate";

const mapLegacyResponse = (payload: PersistedLOR | null | undefined): LORFormData => {
  if (!payload) {
    return { recommenders: [blankRecommender] };
  }

  if (Array.isArray(payload.recommenders) && payload.recommenders.length > 0) {
    const enriched = payload.recommenders.map((item) => ({
      ...blankRecommender,
      ...item,
      name: item?.name ?? (item as any)?.recommender_name ?? "",
      designation: item?.designation ?? (item as any)?.recommender_designation ?? "",
      institution: item?.institution ?? (item as any)?.recommender_institution ?? "",
      email: item?.email ?? (item as any)?.recommender_email ?? "",
      phone: item?.phone ?? "",
      relationship_type: item?.relationship_type ?? "",
      relationship_duration: item?.relationship_duration ?? "",
      courses_projects: item?.courses_projects ?? "",
      key_strengths: item?.key_strengths ?? "",
      specific_examples: item?.specific_examples ?? "",
      grades_performance: item?.grades_performance ?? "",
      research_experience: item?.research_experience ?? "",
      leadership_roles: item?.leadership_roles ?? "",
      communication_skills: item?.communication_skills ?? "",
      recommendation_strength: coerceStrength(item?.recommendation_strength),
    }));

    return {
      recommenders: enriched.length ? enriched : [blankRecommender],
    };
  }

  if (payload.recommender_name) {
    return {
      recommenders: [
        {
          ...blankRecommender,
          name: payload.recommender_name ?? "",
          designation: payload.recommender_designation ?? "",
          institution: payload.recommender_institution ?? "",
          email: payload.recommender_email ?? "",
          phone: payload.recommender_phone ?? "",
          relationship_type: payload.relationship_type ?? "",
          relationship_duration: payload.relationship_duration ?? "",
          courses_projects: payload.courses_projects ?? "",
          key_strengths: payload.key_strengths ?? "",
          specific_examples: payload.specific_examples ?? "",
          grades_performance: payload.grades_performance ?? "",
          research_experience: payload.research_experience ?? "",
          leadership_roles: payload.leadership_roles ?? "",
          communication_skills: payload.communication_skills ?? "",
          recommendation_strength: coerceStrength(payload.recommendation_strength),
        },
      ],
    };
  }

  return { recommenders: [blankRecommender] };
};

const sanitizeRecommenders = (entries: Recommender[]): Recommender[] =>
  entries.map((entry) => ({
    ...blankRecommender,
    ...entry,
    recommendation_strength: coerceStrength(entry.recommendation_strength),
  }));

const formatTimestamp = (value: Date | string | null | undefined) => {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;
  return `${date.toLocaleDateString()} - ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

interface LORFormEnhancedProps {
  onCompleted?: () => void;
}

export function LORFormEnhanced({ onCompleted }: LORFormEnhancedProps = {}) {
  const { user, isEmployee } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [existingResponse, setExistingResponse] = useState<PersistedLOR | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionDate, setSubmissionDate] = useState<string | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [viewRefresh, setViewRefresh] = useState(0);

  const form = useForm<LORFormData>({
    resolver: zodResolver(lorSchema),
    mode: "onChange",
    defaultValues: { recommenders: [blankRecommender] },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "recommenders",
  });

  const loadExistingResponse = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("lor_responses")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      const normalized = mapLegacyResponse((data as any) ?? null);
      form.reset(normalized);
      replace(normalized.recommenders);

      if (data) {
        const persisted = data as any;
        setExistingResponse(persisted);
        setIsSubmitted(true);
        setSubmissionDate(persisted.created_at ?? null);
        setLastSaved(persisted.updated_at ? new Date(persisted.updated_at as string) : null);
        setViewRefresh((prev) => prev + 1);
      } else {
        setExistingResponse(null);
        setIsSubmitted(false);
        setSubmissionDate(null);
        setLastSaved(null);
        setViewRefresh((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error loading LOR response:", error);
    }
  }, [form, replace, user]);

  useEffect(() => {
    if (user) {
      loadExistingResponse();
    }
  }, [loadExistingResponse, user]);

  const buildPayload = useCallback(
    (values: LORFormData) => {
      const sanitized = sanitizeRecommenders(values.recommenders);
      const primary = sanitized[0] ?? blankRecommender;

      return {
        user_id: user?.id,
        recommenders: sanitized,
        recommender_name: primary.name || null,
        recommender_designation: primary.designation || null,
        recommender_institution: primary.institution || null,
        recommender_email: primary.email || null,
        recommender_phone: primary.phone || null,
        relationship_type: primary.relationship_type || null,
        relationship_duration: primary.relationship_duration || null,
        courses_projects: primary.courses_projects || null,
        key_strengths: primary.key_strengths || null,
        specific_examples: primary.specific_examples || null,
        grades_performance: primary.grades_performance || null,
        research_experience: primary.research_experience || null,
        leadership_roles: primary.leadership_roles || null,
        communication_skills: primary.communication_skills || null,
        recommendation_strength: primary.recommendation_strength,
      };
    },
    [user?.id]
  );

  const autoSave = useCallback(
    async (values: LORFormData) => {
      if (!user || isAutoSaving || loading || (!isEmployee && isSubmitted)) return;

      setIsAutoSaving(true);
      try {
        const payload = {
          ...buildPayload(values),
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from("lor_responses")
          .upsert(payload, { onConflict: "user_id" });

        if (error) throw error;
        setLastSaved(new Date());
      } catch (error) {
        console.error("Auto-save failed:", error);
      } finally {
        setIsAutoSaving(false);
      }
    },
    [buildPayload, isAutoSaving, isEmployee, isSubmitted, loading, user]
  );

  useEffect(() => {
    if (isSubmitted) return;

    const timeoutId = setTimeout(() => {
      if (form.formState.isDirty && !form.formState.isSubmitting) {
        autoSave(form.getValues());
      }
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [autoSave, form, form.formState.isDirty, form.formState.isSubmitting, form.watch()]);

  const onSubmit = async (values: LORFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      const payload = buildPayload(values);

      const query = supabase.from("lor_responses");
      const { error } = existingResponse
        ? await query.update(payload).eq("user_id", user.id)
        : await query.insert(payload);

      if (error) throw error;

      toast({
        title: "LOR saved",
        description: "Recommender information has been stored successfully.",
      });

      await loadExistingResponse();
      onCompleted?.();
    } catch (error) {
      console.error("Error saving LOR response:", error);
      toast({
        title: "Save failed",
        description: "We couldn't store your LOR details. Please retry in a moment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    form.reset({ recommenders: [blankRecommender] });
    replace([blankRecommender]);
    setLastSaved(null);
    toast({
      title: "Form cleared",
      description: "All recommender fields have been reset.",
      duration: 3000,
    });
  };

  const handleAddRecommender = () => {
    append({ ...blankRecommender, recommendation_strength: "moderate" });
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
            <CardTitle className="text-2xl">Your recommender details are locked</CardTitle>
            <CardDescription>
              Contact your advisor if you need to update any information. The summary below reflects the details you submitted.
            </CardDescription>
          </CardHeader>
        </Card>
        <LORResponseView refreshKey={viewRefresh} />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">Manage Recommenders</CardTitle>
              <CardDescription>
                {isEmployee
                  ? "Capture rich context for each recommender."
                  : "Provide complete information for every recommender. Once submitted, contact your advisor for changes."}
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
      <CardContent className="space-y-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="rounded-lg border border-dashed p-6 space-y-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <Badge>{`Recommender ${index + 1}`}</Badge>
                      <span className="text-sm text-muted-foreground">Provide accurate contact and relationship details.</span>
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-600"
                        onClick={() => remove(index)}
                        disabled={loading || isAutoSaving}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`recommenders.${index}.name` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Prof. Maria Schmidt" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`recommenders.${index}.designation` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Designation *</FormLabel>
                          <FormControl>
                            <Input placeholder="Associate Professor, Computer Science" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`recommenders.${index}.institution` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Institution *</FormLabel>
                          <FormControl>
                            <Input placeholder="Technical University of Munich" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`recommenders.${index}.email` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="m.schmidt@tum.de" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`recommenders.${index}.phone` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="(+49) 89 1234 5678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`recommenders.${index}.recommendation_strength` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Strength of Recommendation *</FormLabel>
                          <FormControl>
                            <select
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              {...field}
                            >
                              {strengthValues.map((option) => (
                                <option key={option} value={option}>
                                  {option.charAt(0).toUpperCase() + option.slice(1)}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                      <ClipboardList className="h-4 w-4" />
                      <h3 className="text-sm font-semibold">Relationship Overview</h3>
                    </div>
                    <FormField
                      control={form.control}
                      name={`recommenders.${index}.relationship_type` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship Type</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Course instructor, research supervisor, employer..."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`recommenders.${index}.relationship_duration` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration of Relationship</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe how long and in what capacity you have worked together."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Award className="h-4 w-4" />
                      <h3 className="text-sm font-semibold">Highlights & Competencies</h3>
                    </div>
                    <FormField
                      control={form.control}
                      name={`recommenders.${index}.courses_projects` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Courses or Projects Together</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Summarize the academic or professional work you completed together."
                              className="min-h-[110px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`recommenders.${index}.key_strengths` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Key Strengths They Can Highlight</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Mention the qualities or skills they can credibly endorse."
                              className="min-h-[110px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`recommenders.${index}.specific_examples` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specific Success Stories</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Share measurable achievements or anecdotes they witnessed."
                              className="min-h-[110px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`recommenders.${index}.grades_performance` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grades & Performance Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Include grades, rankings, or performance metrics they can reference."
                              className="min-h-[110px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`recommenders.${index}.research_experience` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Research Experience</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Outline research collaborations, publications, or lab work."
                              className="min-h-[110px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`recommenders.${index}.leadership_roles` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Leadership Roles</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe leadership positions they can endorse."
                              className="min-h-[110px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`recommenders.${index}.communication_skills` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Communication Skills</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Highlight presentations, stakeholder interactions, or teamwork they observed."
                              className="min-h-[110px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleAddRecommender}
              className="w-full sm:w-auto"
              disabled={loading || isAutoSaving}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Recommender
            </Button>

            <div className="flex flex-wrap gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save LOR
                  </span>
                )}
              </Button>

              <Button type="button" variant="outline" onClick={handleClearForm} disabled={loading || isAutoSaving}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear Form
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}


























