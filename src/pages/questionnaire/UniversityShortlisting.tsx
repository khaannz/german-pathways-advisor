import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { UniversityShortlistingFormEnhanced } from "@/components/forms/UniversityShortlistingFormEnhanced";

const UniversityShortlisting = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <UniversityShortlistingFormEnhanced />
      </main>
      <Footer />
    </div>
  );
};

export default UniversityShortlisting;