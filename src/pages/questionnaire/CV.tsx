import Header from "@/components/Header";
import { CVForm } from "@/components/forms/CVForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CVQuestionnaire() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" asChild className="mb-4">
              <a href="/questionnaire" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Questionnaire
              </a>
            </Button>
            <h1 className="text-3xl font-bold mb-2">Curriculum Vitae</h1>
            <p className="text-muted-foreground">
              Complete this form to share your educational background, work experience, and skills. 
              Your progress is automatically saved.
            </p>
          </div>
          
          <CVForm />
        </div>
      </div>
    </div>
  );
}