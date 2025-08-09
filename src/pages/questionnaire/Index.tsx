import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, Circle, ArrowRight } from "lucide-react";

interface FormStatus {
  sop: boolean;
  lor: boolean;
  cv: boolean;
}

export default function QuestionnaireIndex() {
  const { user } = useAuth();
  const [formStatus, setFormStatus] = useState<FormStatus>({
    sop: false,
    lor: false,
    cv: false,
  });
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
        supabase.from("sop_responses").select("id").eq("user_id", user.id).maybeSingle(),
        supabase.from("lor_responses").select("id").eq("user_id", user.id).maybeSingle(),
        supabase.from("cv_responses").select("id").eq("user_id", user.id).maybeSingle(),
      ]);

      // Check for errors
      if (sopResponse.error && sopResponse.error.code !== 'PGRST116') {
        throw sopResponse.error;
      }
      if (lorResponse.error && lorResponse.error.code !== 'PGRST116') {
        throw lorResponse.error;
      }
      if (cvResponse.error && cvResponse.error.code !== 'PGRST116') {
        throw cvResponse.error;
      }

      setFormStatus({
        sop: !!sopResponse.data,
        lor: !!lorResponse.data,
        cv: !!cvResponse.data,
      });
    } catch (error) {
      console.error("Error checking form status:", error);
      // Set default status on error
      setFormStatus({
        sop: false,
        lor: false,
        cv: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const forms = [
    {
      id: "sop",
      title: "Statement of Purpose",
      description: "Provide information for your Statement of Purpose document",
      route: "/questionnaire/sop",
      completed: formStatus.sop,
    },
    {
      id: "lor",
      title: "Letter of Recommendation",
      description: "Provide information about your recommender and relationship",
      route: "/questionnaire/lor",
      completed: formStatus.lor,
    },
    {
      id: "cv",
      title: "Curriculum Vitae",
      description: "Share your educational background, work experience, and skills",
      route: "/questionnaire/cv",
      completed: formStatus.cv,
    },
  ];

  const completedCount = Object.values(formStatus).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Application Questionnaire</h1>
            <p className="text-muted-foreground mb-4">
              Complete each section to provide comprehensive information for your application
            </p>
            <div className="flex items-center justify-center gap-2">
              <Badge variant={completedCount === 3 ? "default" : "secondary"}>
                {completedCount}/3 Forms Completed
              </Badge>
            </div>
          </div>

          <div className="grid gap-6">
            {forms.map((form) => (
              <Card key={form.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle className="text-xl">{form.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {form.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {form.completed ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">Completed</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Circle className="h-5 w-5" />
                          <span className="text-sm">Not Started</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <a href={form.route} className="flex items-center justify-center gap-2">
                      {form.completed ? "Edit Form" : "Start Form"}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {completedCount === 3 && (
            <Card className="mt-8 bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    All Forms Completed!
                  </h3>
                  <p className="text-green-700">
                    You have successfully completed all questionnaire sections. 
                    Your information has been saved and can be reviewed by our team.
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