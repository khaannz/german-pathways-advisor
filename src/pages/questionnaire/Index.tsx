import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, Circle, ArrowRight, Clock3 } from "lucide-react";

type FormId = "sop" | "lor" | "cv";
type FormStage = "not_started" | "draft" | "submitted";

type FormStatus = Record<FormId, FormStage>;

const defaultStatus: FormStatus = {
  sop: "not_started",
  lor: "not_started",
  cv: "not_started",
};

const resolveStage = (record: { id?: string | null; submitted_at?: string | null } | null): FormStage => {
  if (record?.submitted_at) return "submitted";
  if (record?.id) return "draft";
  return "not_started";
};

export default function QuestionnaireIndex() {
  const { user, isEmployee } = useAuth();
  const [formStatus, setFormStatus] = useState<FormStatus>(defaultStatus);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkFormStatus();
    }
  }, [user]);

  const checkFormStatus = async () => {
    if (!user) return;

    try {
      const [sopResponse, lorResponse, cvResponse] = await Promise.all([
        supabase.from("sop_responses").select("id, submitted_at").eq("user_id", user.id).maybeSingle(),
        supabase.from("lor_responses").select("id, submitted_at").eq("user_id", user.id).maybeSingle(),
        supabase.from("cv_responses").select("id, submitted_at").eq("user_id", user.id).maybeSingle(),
      ]);

      if (sopResponse.error && sopResponse.error.code !== "PGRST116") throw sopResponse.error;
      if (lorResponse.error && lorResponse.error.code !== "PGRST116") throw lorResponse.error;
      if (cvResponse.error && cvResponse.error.code !== "PGRST116") throw cvResponse.error;

      setFormStatus({
        sop: resolveStage(sopResponse.data),
        lor: resolveStage(lorResponse.data),
        cv: resolveStage(cvResponse.data),
      });
    } catch (error) {
      console.error("Error checking form status:", error);
      setFormStatus(defaultStatus);
    } finally {
      setLoading(false);
    }
  };

  const submittedCount = Object.values(formStatus).filter((status) => status === "submitted").length;
  const heroDescription = isEmployee
    ? "Complete each section to keep student dossiers production-ready."
    : "Start, continue, or review the questionnaires that feed your applications.";
  const badgeLabel = isEmployee ? "Forms submitted" : "Responses submitted";

  const forms = [
    {
      id: "sop" as FormId,
      title: "Statement of Purpose",
      description: isEmployee
        ? "Collect the narrative inputs that power the SOP draft"
        : "Draft the story that will anchor your SOP",
      route: "/questionnaire/sop",
    },
    {
      id: "lor" as FormId,
      title: "Letter of Recommendation",
      description: isEmployee
        ? "Capture recommender details and talking points"
        : "Provide the context your recommenders will need",
      route: "/questionnaire/lor",
    },
    {
      id: "cv" as FormId,
      title: "Curriculum Vitae",
      description: isEmployee
        ? "Compile academic, professional, and skills highlights"
        : "Summarize your experience and accomplishments",
      route: "/questionnaire/cv",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Application Questionnaire</h1>
            <p className="text-muted-foreground mb-4">{heroDescription}</p>
            <div className="flex items-center justify-center gap-2">
              <Badge variant={submittedCount === forms.length ? "default" : "secondary"}>
                {submittedCount}/{forms.length} {badgeLabel}
              </Badge>
            </div>
          </div>

          <div className="grid gap-6">
            {forms.map((form) => {
              const status = formStatus[form.id];
              const buttonLabel = (() => {
                if (status === "submitted") {
                  return isEmployee ? "Edit Form" : "View Response";
                }
                if (status === "draft") {
                  return "Continue Form";
                }
                return "Start Form";
              })();

              const statusIndicator = (() => {
                if (status === "submitted") {
                  return (
                    <span className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      Completed
                    </span>
                  );
                }
                if (status === "draft") {
                  return (
                    <span className="flex items-center gap-2 text-amber-600">
                      <Clock3 className="h-5 w-5" />
                      In progress
                    </span>
                  );
                }
                return (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Circle className="h-5 w-5" />
                    Not started
                  </span>
                );
              })();

              return (
                <Card key={form.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6 text-primary" />
                        <div>
                          <CardTitle className="text-xl">{form.title}</CardTitle>
                          <CardDescription className="mt-1">{form.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">{statusIndicator}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" disabled={loading} asChild>
                      <a href={form.route} className="flex items-center justify-center gap-2">
                        {buttonLabel}
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {isEmployee && submittedCount === forms.length && (
            <Card className="mt-8 bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">All Forms Completed!</h3>
                  <p className="text-green-700">
                    Every questionnaire section is locked in. You can continue refining responses or move on to the next
                    milestone.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
