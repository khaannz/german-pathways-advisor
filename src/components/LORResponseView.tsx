import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Users, Mail, Building2, Award, Clock } from "lucide-react";

interface RawLORResponse {
  created_at?: string | null;
  updated_at?: string | null;
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

interface RecommenderViewModel {
  name: string;
  designation: string;
  institution: string;
  email: string;
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
  recommendation_strength: string;
}

const strengthLabel = (value?: string | null) => {
  if (!value) return "Not specified";
  const normalized = value.toLowerCase();
  if (["strong", "moderate", "weak"].includes(normalized)) {
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }
  return value;
};

const coerceString = (value?: string | null) => value ?? "";

const extractRecommenders = (payload: RawLORResponse | null): RecommenderViewModel[] => {
  if (!payload) return [];

  if (Array.isArray(payload.recommenders) && payload.recommenders.length > 0) {
    return payload.recommenders.map((item) => ({
      name: coerceString(item?.name ?? item?.recommender_name),
      designation: coerceString(item?.designation ?? item?.recommender_designation),
      institution: coerceString(item?.institution ?? item?.recommender_institution),
      email: coerceString(item?.email ?? item?.recommender_email),
      phone: coerceString(item?.phone),
      relationship_type: coerceString(item?.relationship_type),
      relationship_duration: coerceString(item?.relationship_duration),
      courses_projects: coerceString(item?.courses_projects),
      key_strengths: coerceString(item?.key_strengths),
      specific_examples: coerceString(item?.specific_examples),
      grades_performance: coerceString(item?.grades_performance),
      research_experience: coerceString(item?.research_experience),
      leadership_roles: coerceString(item?.leadership_roles),
      communication_skills: coerceString(item?.communication_skills),
      recommendation_strength: strengthLabel(item?.recommendation_strength),
    })).filter((item) => item.name.trim().length > 0);
  }

  if (payload.recommender_name) {
    return [
      {
        name: coerceString(payload.recommender_name),
        designation: coerceString(payload.recommender_designation),
        institution: coerceString(payload.recommender_institution),
        email: coerceString(payload.recommender_email),
        phone: coerceString(payload.recommender_phone),
        relationship_type: coerceString(payload.relationship_type),
        relationship_duration: coerceString(payload.relationship_duration),
        courses_projects: coerceString(payload.courses_projects),
        key_strengths: coerceString(payload.key_strengths),
        specific_examples: coerceString(payload.specific_examples),
        grades_performance: coerceString(payload.grades_performance),
        research_experience: coerceString(payload.research_experience),
        leadership_roles: coerceString(payload.leadership_roles),
        communication_skills: coerceString(payload.communication_skills),
        recommendation_strength: strengthLabel(payload.recommendation_strength),
      },
    ];
  }

  return [];
};

const formatTimestamp = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.toLocaleDateString()} • ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

export function LORResponseView({ refreshKey = 0 }: LORResponseViewProps = {}) {
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
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const recommenders = extractRecommenders(response);
  const submittedAt = formatTimestamp(response?.submitted_at ?? null);
  const updatedAt = formatTimestamp(response?.updated_at ?? null);

  if (recommenders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No LOR details available</CardTitle>
          <CardDescription>
            We couldn\'t find any recommender information yet. Please contact your advisor if this seems incorrect.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle className="text-xl">Letter of Recommendation Overview</CardTitle>
          </div>
          <CardDescription>
            {recommenders.length === 1
              ? "1 recommender added"
              : `${recommenders.length} recommenders added`}
          </CardDescription>
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
          </div>
        </CardHeader>
      </Card>

      {recommenders.map((recommender, index) => (
        <Card key={`${recommender.email}-${index}`} className="border border-muted/60">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">{recommender.name}</CardTitle>
                <CardDescription>{recommender.designation}</CardDescription>
              </div>
              <Badge variant="secondary">Recommender {index + 1}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 text-sm md:grid-cols-2">
              <div className="space-y-1">
                <p className="flex items-center gap-2 font-medium"><Building2 className="h-4 w-4 text-muted-foreground" />Institution</p>
                <p className="rounded-md border bg-muted/20 px-3 py-2 text-muted-foreground">
                  {recommender.institution || "Not provided"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="flex items-center gap-2 font-medium"><Mail className="h-4 w-4 text-muted-foreground" />Contact</p>
                <p className="rounded-md border bg-muted/20 px-3 py-2 text-muted-foreground">
                  {recommender.email}
                  {recommender.phone ? ` • ${recommender.phone}` : ""}
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">Recommendation Strength</p>
                <Badge variant="outline">{recommender.recommendation_strength}</Badge>
              </div>
              <div className="space-y-1">
                <p className="font-medium">Relationship Duration</p>
                <p className="rounded-md border bg-muted/20 px-3 py-2 text-muted-foreground">
                  {recommender.relationship_duration || "Not provided"}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4 text-sm">
              {recommender.relationship_type && (
                <div>
                  <h4 className="font-semibold text-foreground">Relationship Context</h4>
                  <p className="mt-1 whitespace-pre-line text-muted-foreground">
                    {recommender.relationship_type}
                  </p>
                </div>
              )}
              {recommender.courses_projects && (
                <div>
                  <h4 className="font-semibold text-foreground">Courses & Projects</h4>
                  <p className="mt-1 whitespace-pre-line text-muted-foreground">
                    {recommender.courses_projects}
                  </p>
                </div>
              )}
              {recommender.key_strengths && (
                <div>
                  <h4 className="font-semibold text-foreground">Key Strengths</h4>
                  <p className="mt-1 whitespace-pre-line text-muted-foreground">
                    {recommender.key_strengths}
                  </p>
                </div>
              )}
              {recommender.specific_examples && (
                <div>
                  <h4 className="font-semibold text-foreground">Specific Examples</h4>
                  <p className="mt-1 whitespace-pre-line text-muted-foreground">
                    {recommender.specific_examples}
                  </p>
                </div>
              )}
              {recommender.grades_performance && (
                <div>
                  <h4 className="font-semibold text-foreground">Grades & Performance</h4>
                  <p className="mt-1 whitespace-pre-line text-muted-foreground">
                    {recommender.grades_performance}
                  </p>
                </div>
              )}
              {recommender.research_experience && (
                <div>
                  <h4 className="font-semibold text-foreground">Research Experience</h4>
                  <p className="mt-1 whitespace-pre-line text-muted-foreground">
                    {recommender.research_experience}
                  </p>
                </div>
              )}
              {recommender.leadership_roles && (
                <div>
                  <h4 className="font-semibold text-foreground">Leadership Roles</h4>
                  <p className="mt-1 whitespace-pre-line text-muted-foreground">
                    {recommender.leadership_roles}
                  </p>
                </div>
              )}
              {recommender.communication_skills && (
                <div>
                  <h4 className="font-semibold text-foreground">Communication Skills</h4>
                  <p className="mt-1 whitespace-pre-line text-muted-foreground">
                    {recommender.communication_skills}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}





