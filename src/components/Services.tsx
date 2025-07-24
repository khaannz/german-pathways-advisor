import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  GraduationCap, 
  Plane, 
  CreditCard, 
  BookOpen, 
  Users,
  ArrowRight 
} from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: FileText,
      title: "Application Assistance",
      description: "Complete support for university applications, document preparation, and submission process.",
      features: ["CV/Resume Writing", "Motivation Letters", "Document Translation", "Application Review"]
    },
    {
      icon: Plane,
      title: "Visa & Immigration",
      description: "End-to-end visa support to ensure smooth entry into Germany for your studies.",
      features: ["Visa Application", "Document Verification", "Interview Preparation", "Travel Guidance"]
    },
    {
      icon: CreditCard,
      title: "Scholarship Guidance",
      description: "Identify and apply for scholarships and financial aid opportunities.",
      features: ["Scholarship Search", "Application Support", "Financial Planning", "Funding Strategy"]
    },
    {
      icon: BookOpen,
      title: "Course Selection",
      description: "Expert advice on choosing the right program and university for your career goals.",
      features: ["University Matching", "Program Analysis", "Career Counseling", "Academic Planning"]
    },
    {
      icon: Users,
      title: "Pre-Departure Support",
      description: "Comprehensive preparation for your life and studies in Germany.",
      features: ["Accommodation Help", "Cultural Orientation", "Language Support", "Networking Events"]
    },
    {
      icon: GraduationCap,
      title: "Post-Arrival Services",
      description: "Continued support after you arrive in Germany to ensure successful integration.",
      features: ["University Enrollment", "City Registration", "Bank Account Setup", "Ongoing Mentorship"]
    }
  ];

  return (
    <section id="services" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <GraduationCap className="h-4 w-4" />
            Our Services
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
            Complete Support for Your 
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> German Education Journey</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From initial consultation to post-arrival support, we provide comprehensive services 
            to make your German university dreams a reality.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="p-6 h-full bg-gradient-to-br from-card to-card/50 border-border/50 hover:shadow-lg transition-all duration-300 group">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-r from-primary to-accent p-3 rounded-lg">
                    <service.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{service.title}</h3>
                </div>
                
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
                
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button variant="ghost" className="w-full group-hover:bg-primary/10 transition-colors">
                  Learn More
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="hero" size="lg">
            Schedule Free Consultation
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Services;