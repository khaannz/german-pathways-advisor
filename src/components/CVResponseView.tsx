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

const formatTimestamp = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return `${parsed.toLocaleDateString()} • ${parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

const Section = ({
  title,
  icon,
  content,
}: {
  title: string;
  icon: ReactNode;
  content?: string | null;
}) => {
  if (!content) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {title}
      </div>
      <p className="whitespace-pre-line rounded-md border border-muted/60 bg-muted/10 px-3 py-3 text-sm text-muted-foreground">
        {content}
      </p>
    </div>
  );
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
            We couldn\'t find a CV submission linked to your account yet. Your advisor can help you add one when it\'s ready.
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
            <FileText className="h-5 w-5" />
            <CardTitle className="text-xl">Curriculum Vitae Overview</CardTitle>
          </div>
          <CardDescription>Read-only snapshot of the CV information on file.</CardDescription>
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
        {response.photo_url && (
          <CardContent className="pt-0">
            <div className="mt-4 flex items-center gap-4 rounded-lg border border-dashed border-muted/60 p-4">
              <img
                src={response.photo_url}
                alt="Professional headshot"
                className="h-20 w-20 rounded-md object-cover"
              />
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Professional photo on file.</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(response.photo_url!, "_blank")}
                  className="inline-flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Open Photo
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <Card className="border border-muted/60">
        <CardHeader>
          <CardTitle className="text-lg">Executive Summary</CardTitle>
          <CardDescription>Overview of your profile and ambitions.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line rounded-md border border-muted/60 bg-muted/10 px-3 py-3 text-sm text-muted-foreground">
            {response.summary || "No summary provided."}
          </p>
        </CardContent>
      </Card>

      <Card className="border border-muted/60">
        <CardHeader>
          <CardTitle className="text-lg">Experience & Education</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Section title="Education" icon={<GraduationCap className="h-4 w-4" />} content={response.education_history} />
          <Section title="Work Experience" icon={<Briefcase className="h-4 w-4" />} content={response.work_experience} />
        </CardContent>
      </Card>

      <Card className="border border-muted/60">
        <CardHeader>
          <CardTitle className="text-lg">Skills & Credentials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Section title="Technical Skills" icon={<Layers className="h-4 w-4" />} content={response.technical_skills} />
          <Section title="Soft Skills" icon={<Award className="h-4 w-4" />} content={response.soft_skills} />
          <Section title="Languages" icon={<Globe className="h-4 w-4" />} content={response.languages} />
          <Section title="Certifications" icon={<FileText className="h-4 w-4" />} content={response.certifications} />
        </CardContent>
      </Card>

      <Card className="border border-muted/60">
        <CardHeader>
          <CardTitle className="text-lg">Extracurricular Highlights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line rounded-md border border-muted/60 bg-muted/10 px-3 py-3 text-sm text-muted-foreground">
            {response.extracurriculars || "No extracurricular information provided."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}








