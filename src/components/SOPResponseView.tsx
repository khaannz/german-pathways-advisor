import { useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, BookOpen, Target, Star, Globe, Clock } from "lucide-react";

interface SOPResponse {
  created_at?: string | null;
  updated_at?: string | null;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  nationality?: string | null;
  date_of_birth?: string | null;
  linked_in?: string | null;
  current_education_status?: string | null;
  intended_program?: string | null;
  target_universities?: string | null;
  why_this_program?: string | null;
  why_germany?: string | null;
  short_term_goals?: string | null;
  long_term_goals?: string | null;
  has_thesis?: boolean | null;
  thesis_details?: string | null;
  academic_projects?: string | null;
  work_experience?: string | null;
  personal_qualities?: string | null;
  challenges_accomplishments?: string | null;
  research_interests?: string | null;
  language_proficiency?: string | null;
  financial_planning?: string | null;
}

interface SectionItem {
  label: string;
  value?: string | null;
}

interface Section {
  title: string;
  icon: React.ReactNode;
  items: SectionItem[];
}

const formatTimestamp = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return `${parsed.toLocaleDateString()} � ${parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

const openInNewTab = (url?: string | null) => {
  if (!url) return "";
  try {
    const normalized = url.startsWith("http") ? url : `https://${url}`;
    return normalized;
  } catch (error) {
    return url;
  }
};

export function SOPResponseView() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState<SOPResponse | null>(null);

  useEffect(() => {
    const fetchResponse = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("sop_responses")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        setResponse((data as SOPResponse) ?? null);
      } catch (error) {
        console.error("Unable to load SOP response:", error);
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

  const sections: Section[] = response ? [
    {
      title: "Applicant Profile",
      icon: <User className="h-4 w-4" />,
      items: [
        { label: "Full Name", value: response.full_name },
        { label: "Email", value: response.email },
        { label: "Phone", value: response.phone },
        { label: "Nationality", value: response.nationality },
        { label: "Date of Birth", value: response.date_of_birth },
        { label: "LinkedIn", value: response.linked_in },
      ],
    },
    {
      title: "Academic Background",
      icon: <BookOpen className="h-4 w-4" />,
      items: [
        { label: "Current Education Status", value: response.current_education_status },
        { label: "Intended Program", value: response.intended_program },
        { label: "Target Universities", value: response.target_universities },
        { label: "Academic Projects", value: response.academic_projects },
        { label: "Work Experience", value: response.work_experience },
      ],
    },
    {
      title: "Goals & Motivation",
      icon: <Target className="h-4 w-4" />,
      items: [
        { label: "Why this Program", value: response.why_this_program },
        { label: "Why Germany", value: response.why_germany },
        { label: "Short-term Goals", value: response.short_term_goals },
        { label: "Long-term Goals", value: response.long_term_goals },
        { label: "Research Interests", value: response.research_interests },
      ],
    },
    {
      title: "Personal Narrative",
      icon: <Star className="h-4 w-4" />,
      items: [
        { label: "Personal Qualities", value: response.personal_qualities },
        { label: "Challenges & Accomplishments", value: response.challenges_accomplishments },
      ],
    },
    {
      title: "Logistics & Planning",
      icon: <Globe className="h-4 w-4" />,
      items: [
        { label: "Language Proficiency", value: response.language_proficiency },
        { label: "Financial Planning", value: response.financial_planning },
        { label: "Thesis Details", value: response.thesis_details },
      ],
    },
  ] : [];

  if (!response) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No SOP details available</CardTitle>
          <CardDescription>
            We couldn\'t find a Statement of Purpose response for your profile. Please reach out to your advisor if you were expecting to see one here.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const submittedAt = formatTimestamp(response.submitted_at);
  const updatedAt = formatTimestamp(response.updated_at);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle className="text-xl">Statement of Purpose Overview</CardTitle>
          </div>
          <CardDescription>Review the information shared for your SOP draft.</CardDescription>
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
            {response.has_thesis !== null && (
              <Badge variant={response.has_thesis ? "default" : "outline"}>
                Thesis {response.has_thesis ? "included" : "not required"}
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {sections.map((section) => {
        const visibleItems = section.items.filter((item) => Boolean(item.value));
        if (visibleItems.length === 0) return null;

        return (
          <Card key={section.title} className="border border-muted/60">
            <CardHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {section.icon}
                {section.title}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {visibleItems.map((item) => (
                <div key={item.label}>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  {item.label === "LinkedIn" ? (
                    <a
                      href={openInNewTab(item.value)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center text-sm text-primary underline"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                      {item.value}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}






