import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VisaMotivationFormEnhanced } from "@/components/forms/VisaMotivationFormEnhanced";

const VisaMotivation = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <VisaMotivationFormEnhanced />
      </main>
      <Footer />
    </div>
  );
};

export default VisaMotivation;