import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CoverLetterFormEnhanced } from "@/components/forms/CoverLetterFormEnhanced";

const CoverLetter = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-8">
        <CoverLetterFormEnhanced />
      </main>
      <Footer />
    </div>
  );
};

export default CoverLetter;