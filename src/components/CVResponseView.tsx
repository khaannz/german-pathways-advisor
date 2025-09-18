import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, GraduationCap, Briefcase, Layers, Award, Download, Clock, Globe } from "lucide-react";

interface CVResponse {
  created_at?: string | null;
  updated_at?: string | null;
  submitted_at?: string | null;
  summary?: string | null;
  education_history?: string | null;
  work_experience?: string | null;
  technical_skills?: string | null;
  soft_skills?: string | null;
  languages?: string | null;
  certifications?: string | null;
  extracurriculars?: string | null;
  photo_url?: string | null;
}

interface SectionItemProps {
  label: string;
  value?: string | null;
  icon?: ReactNode;
  className?: string;
}

const SectionItem = ({ label, value, icon, className = "" }: SectionItemProps) => {
  if (!value || value.trim() === "") return null;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center gap-2">
        {icon && <div className="text-primary">{icon}</div>}
        <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </h4>
      </div>
      <div className="pl-6">
        <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
};

interface Section {
  title: string;
  icon: ReactNode;
  items: SectionItemProps[];
}

const formatTimestamp = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return `${parsed.toLocaleDateString()} • ${parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

export function CVResponseView() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState<CVResponse | null>(null);

  useEffect(() => {
    const fetchResponse = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("cv_responses")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        setResponse((data as CVResponse) ?? null);
      } catch (error) {
        console.error("Unable to load CV response:", error);
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

  if (!response) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No CV details available</CardTitle>
          <CardDescription>
            We couldn't find a CV response for your profile. Please reach out to your advisor if you were expecting to see one here.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const submittedAt = formatTimestamp(response.submitted_at);
  const updatedAt = formatTimestamp(response.updated_at);

  const sections: Section[] = [
    {
      title: "Professional Summary",
      icon: <Award className="h-4 w-4" />,
      items: [
        { label: "Summary", value: response.summary, icon: <FileText className="h-3.5 w-3.5" /> }
      ]
    },
    {
      title: "Academic Background",
      icon: <GraduationCap className="h-4 w-4" />,
      items: [
        { label: "Education History", value: response.education_history, icon: <GraduationCap className="h-3.5 w-3.5" /> }
      ]
    },
    {
      title: "Professional Experience",
      icon: <Briefcase className="h-4 w-4" />,
      items: [
        { label: "Work Experience", value: response.work_experience, icon: <Briefcase className="h-3.5 w-3.5" /> }
      ]
    },
    {
      title: "Skills & Competencies",
      icon: <Layers className="h-4 w-4" />,
      items: [
        { label: "Technical Skills", value: response.technical_skills, icon: <Layers className="h-3.5 w-3.5" /> },
        { label: "Soft Skills", value: response.soft_skills, icon: <Award className="h-3.5 w-3.5" /> }
      ]
    },
    {
      title: "Additional Qualifications",
      icon: <Globe className="h-4 w-4" />,
      items: [
        { label: "Languages", value: response.languages, icon: <Globe className="h-3.5 w-3.5" /> },
        { label: "Certifications", value: response.certifications, icon: <Award className="h-3.5 w-3.5" /> },
        { label: "Extracurricular Activities", value: response.extracurriculars, icon: <FileText className="h-3.5 w-3.5" /> }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle className="text-xl">CV Overview</CardTitle>
          </div>
          <CardDescription>Review the information shared for your CV draft.</CardDescription>
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
            {response.photo_url && (
              <Badge variant="default">Photo included</Badge>
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
            <CardContent className="space-y-6">
              {visibleItems.map((item) => (
                <SectionItem key={item.label} {...item} />
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}