import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Users, Mail, Building2, Award, Clock } from "lucide-react";

interface LORResponseViewProps {
  refreshKey?: number;
}

interface RawLORResponse {
  created_at?: string | null;
  updated_at?: string | null;
  submitted_at?: string | null;
  recommenders?: any[] | null;
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
  recommendation_strength?: string | null;
}

interface NormalizedRecommender {
  name?: string;
  designation?: string;
  institution?: string;
  email?: string;
  phone?: string;
  relationship_type?: string;
  relationship_duration?: string;
  courses_projects?: string;
  key_strengths?: string;
  specific_examples?: string;
  grades_performance?: string;
  research_experience?: string;
  leadership_roles?: string;
  communication_skills?: string;
  recommendation_strength?: string;
}

const formatTimestamp = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return `${parsed.toLocaleDateString()} • ${parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

const normalizeRecommenders = (payload: RawLORResponse): NormalizedRecommender[] => {
  if (Array.isArray(payload.recommenders) && payload.recommenders.length > 0) {
    return payload.recommenders.map((rec) => ({
      name: rec?.name || rec?.recommender_name || "",
      designation: rec?.designation || rec?.recommender_designation || "",
      institution: rec?.institution || rec?.recommender_institution || "",
      email: rec?.email || rec?.recommender_email || "",
      phone: rec?.phone || rec?.recommender_phone || "",
      relationship_type: rec?.relationship_type || "",
      relationship_duration: rec?.relationship_duration || "",
      courses_projects: rec?.courses_projects || "",
      key_strengths: rec?.key_strengths || "",
      specific_examples: rec?.specific_examples || "",
      grades_performance: rec?.grades_performance || "",
      research_experience: rec?.research_experience || "",
      leadership_roles: rec?.leadership_roles || "",
      communication_skills: rec?.communication_skills || "",
      recommendation_strength: rec?.recommendation_strength || "",
    }));
  }

  // Fallback: construct from legacy flat fields
  if (payload.recommender_name || payload.recommender_email) {
    return [{
      name: payload.recommender_name || "",
      designation: payload.recommender_designation || "",
      institution: payload.recommender_institution || "",
      email: payload.recommender_email || "",
      phone: payload.recommender_phone || "",
      relationship_type: payload.relationship_type || "",
      relationship_duration: payload.relationship_duration || "",
      courses_projects: payload.courses_projects || "",
      key_strengths: payload.key_strengths || "",
      specific_examples: payload.specific_examples || "",
      grades_performance: payload.grades_performance || "",
      research_experience: payload.research_experience || "",
      leadership_roles: payload.leadership_roles || "",
      communication_skills: payload.communication_skills || "",
      recommendation_strength: payload.recommendation_strength || "",
    }];
  }

  return [];
};

const getStrengthBadgeVariant = (strength?: string) => {
  switch (strength?.toLowerCase()) {
    case "strong":
      return "default";
    case "moderate":
      return "secondary";
    case "weak":
      return "outline";
    default:
      return "secondary";
  }
};

export function LORResponseView({ refreshKey }: LORResponseViewProps = {}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState<RawLORResponse | null>(null);

  useEffect(() => {
    const fetchResponse = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("lor_responses")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        setResponse((data as RawLORResponse) ?? null);
      } catch (error) {
        console.error("Unable to load LOR response:", error);
        setResponse(null);
      } finally {
        setLoading(false);
      }
    };

    fetchResponse();
  }, [user, refreshKey]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!response) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No LOR details available</CardTitle>
          <CardDescription>
            We couldn't find a Letter of Recommendation response for your profile. Please reach out to your advisor if you were expecting to see one here.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const recommenders = normalizeRecommenders(response);
  const submittedAt = formatTimestamp(response.submitted_at);
  const updatedAt = formatTimestamp(response.updated_at);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle className="text-xl">Letter of Recommendation Overview</CardTitle>
          </div>
          <CardDescription>Review the recommender information shared for your LOR drafts.</CardDescription>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {submittedAt && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Submitted {submittedAt}
              </Badge>
            )}
            {updatedAt && updatedAt !== submittedAt && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Updated {updatedAt}
              </Badge>
            )}
            <Badge variant="default">{recommenders.length} Recommender{recommenders.length !== 1 ? "s" : ""}</Badge>
          </div>
        </CardHeader>
      </Card>

      {recommenders.map((recommender, index) => (
        <Card key={index} className="border border-muted/60">
          <CardHeader className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Users className="h-4 w-4" />
                Recommender {index + 1}
              </div>
              {recommender.recommendation_strength && (
                <Badge variant={getStrengthBadgeVariant(recommender.recommendation_strength)}>
                  {recommender.recommendation_strength} recommendation
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {recommender.name && (
                <div>
                  <p className="text-sm font-medium text-foreground">Full Name</p>
                  <p className="mt-1 text-sm text-muted-foreground">{recommender.name}</p>
                </div>
              )}
              {recommender.designation && (
                <div>
                  <p className="text-sm font-medium text-foreground">Designation</p>
                  <p className="mt-1 text-sm text-muted-foreground">{recommender.designation}</p>
                </div>
              )}
              {recommender.institution && (
                <div>
                  <p className="text-sm font-medium text-foreground">Institution</p>
                  <p className="mt-1 text-sm text-muted-foreground">{recommender.institution}</p>
                </div>
              )}
              {recommender.email && (
                <div>
                  <p className="text-sm font-medium text-foreground">Email</p>
                  <p className="mt-1 text-sm text-muted-foreground">{recommender.email}</p>
                </div>
              )}
              {recommender.phone && (
                <div>
                  <p className="text-sm font-medium text-foreground">Phone</p>
                  <p className="mt-1 text-sm text-muted-foreground">{recommender.phone}</p>
                </div>
              )}
              {recommender.relationship_type && (
                <div>
                  <p className="text-sm font-medium text-foreground">Relationship Type</p>
                  <p className="mt-1 text-sm text-muted-foreground">{recommender.relationship_type}</p>
                </div>
              )}
              {recommender.relationship_duration && (
                <div>
                  <p className="text-sm font-medium text-foreground">Relationship Duration</p>
                  <p className="mt-1 text-sm text-muted-foreground">{recommender.relationship_duration}</p>
                </div>
              )}
            </div>

            {(recommender.courses_projects || recommender.key_strengths || recommender.specific_examples || 
              recommender.grades_performance || recommender.research_experience || 
              recommender.leadership_roles || recommender.communication_skills) && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Detailed Information
                  </h4>
                  <div className="grid gap-4">
                    {[
                      { label: "Courses & Projects", value: recommender.courses_projects },
                      { label: "Key Strengths", value: recommender.key_strengths },
                      { label: "Specific Examples", value: recommender.specific_examples },
                      { label: "Grades & Performance", value: recommender.grades_performance },
                      { label: "Research Experience", value: recommender.research_experience },
                      { label: "Leadership Roles", value: recommender.leadership_roles },
                      { label: "Communication Skills", value: recommender.communication_skills },
                    ]
                      .filter(item => item.value)
                      .map(item => (
                        <div key={item.label}>
                          <p className="text-sm font-medium text-foreground">{item.label}</p>
                          <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{item.value}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}