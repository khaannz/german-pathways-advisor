import { useState } from "react";
import Header from "@/components/Header";
import { LORFormEnhanced } from "@/components/forms/LORFormEnhanced";
import { LORResponseView } from "@/components/LORResponseView";
import { useAuth } from "@/components/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

export default function LORQuestionnaire() {
  const { isEmployee, loading } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCompleted = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const description = isEmployee
    ? "Capture detailed information from every recommender so our writers have the full story."
    : "Share complete recommender details. After you submit, reach out to your advisor if you need any changes.";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <a href="/questionnaire" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Questionnaire
              </a>
            </Button>
            <h1 className="text-3xl font-bold mb-2">Letter of Recommendation</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isEmployee ? (
            <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
              <LORFormEnhanced onCompleted={handleCompleted} />
              <div className="space-y-4">
                <LORResponseView refreshKey={refreshKey} />
              </div>
            </div>
          ) : (
            <LORFormEnhanced onCompleted={handleCompleted} />
          )}
        </div>
      </div>
    </div>
  );
}
