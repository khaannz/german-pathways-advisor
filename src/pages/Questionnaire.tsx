import Header from "@/components/Header";
import { SOPForm } from "@/components/forms/SOPForm";
import { LORForm } from "@/components/forms/LORForm";
import { CVForm } from "@/components/forms/CVForm";

export default function Questionnaire() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">
            Application Questionnaire
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Complete each section separately. Your progress is automatically saved.
          </p>
          
          <div className="space-y-8">
            <SOPForm />
            <LORForm />
            <CVForm />
          </div>
        </div>
      </div>
    </div>
  );
}