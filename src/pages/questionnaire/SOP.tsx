import { useState } from "react";
import Header from "@/components/Header";
import { SOPFormEnhanced } from "@/components/forms/SOPFormEnhanced";
import { SOPResponseView } from "@/components/SOPResponseView";
import { useAuth } from "@/components/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

export default function SOPQuestionnaire() {
  const { isEmployee, loading } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCompleted = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const description = isEmployee
    ? "Gather structured inputs so the SOP team can craft a compelling narrative."
    : "Complete the prompts that shape your Statement of Purpose. After submitting, contact your advisor for changes.";

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
            <h1 className="text-3xl font-bold mb-2">Statement of Purpose</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : isEmployee ? (
            <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
              <SOPFormEnhanced onCompleted={handleCompleted} />
              <div className="space-y-4">
                <SOPResponseView refreshKey={refreshKey} />
              </div>
            </div>
          ) : (
            <SOPFormEnhanced onCompleted={handleCompleted} />
          )}
        </div>
      </div>
    </div>
  );
}
