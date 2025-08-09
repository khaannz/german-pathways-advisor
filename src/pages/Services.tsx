import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  GraduationCap, 
  Plane, 
  CreditCard, 
  BookOpen, 
  Users,
  ArrowRight,
  Check,
  Star,
  Shield,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Services = () => {
  const consultationPackages = [
    {
      name: "Essential Package",
      price: "€299",
      duration: "3 months support",
      popular: false,
      description: "Perfect for students who need basic guidance",
      features: [
        "University shortlisting (up to 5 universities)",
        "Basic SOP review",
        "Document checklist",
        "Email support",
        "Application timeline",
      ],
      limitations: [
        "No LOR assistance",
        "No CV writing",
        "Limited revisions"
      ]
    },
    {
      name: "Premium Package",
      price: "€599",
      duration: "6 months support",
      popular: true,
      description: "Most comprehensive package for serious applicants",
      features: [
        "University shortlisting (up to 10 universities)",
        "Professional SOP writing",
        "LOR guidance and templates",
        "Professional CV creation",
        "Document upload and management",
        "Task management system",
        "Priority email & chat support",
        "Application tracking",
        "Interview preparation",
        "Visa guidance",
      ],
      limitations: []
    },
    {
      name: "VIP Package",
      price: "€999",
      duration: "12 months support",
      popular: false,
      description: "White-glove service with personal consultant",
      features: [
        "Unlimited university shortlisting",
        "Premium SOP writing with multiple revisions",
        "LOR writing assistance",
        "Professional CV with LinkedIn optimization",
        "Priority document processing",
        "Personal consultant assigned",
        "Video call consultations (monthly)",
        "Post-arrival support in Germany",
        "Scholarship application assistance",
        "Emergency support hotline",
      ],
      limitations: []
    }
  ];

  const services = [
    {
      icon: FileText,
      title: "Application Assistance",
      description: "Complete support for university applications, document preparation, and submission process.",
      features: ["CV/Resume Writing", "Motivation Letters", "Document Translation", "Application Review"],
      included: ["Premium", "VIP"]
    },
    {
      icon: Plane,
      title: "Visa & Immigration",
      description: "End-to-end visa support to ensure smooth entry into Germany for your studies.",
      features: ["Visa Application", "Document Verification", "Interview Preparation", "Travel Guidance"],
      included: ["Premium", "VIP"]
    },
    {
      icon: CreditCard,
      title: "Scholarship Guidance",
      description: "Identify and apply for scholarships and financial aid opportunities.",
      features: ["Scholarship Search", "Application Support", "Financial Planning", "Funding Strategy"],
      included: ["VIP"]
    },
    {
      icon: BookOpen,
      title: "Course Selection",
      description: "Expert advice on choosing the right program and university for your career goals.",
      features: ["University Matching", "Program Analysis", "Career Counseling", "Academic Planning"],
      included: ["Essential", "Premium", "VIP"]
    },
    {
      icon: Users,
      title: "Pre-Departure Support",
      description: "Comprehensive preparation for your life and studies in Germany.",
      features: ["Accommodation Help", "Cultural Orientation", "Language Support", "Networking Events"],
      included: ["Premium", "VIP"]
    },
    {
      icon: GraduationCap,
      title: "Post-Arrival Services",
      description: "Continued support after you arrive in Germany to ensure successful integration.",
      features: ["University Enrollment", "City Registration", "Bank Account Setup", "Ongoing Mentorship"],
      included: ["VIP"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Our Consultation Services
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Comprehensive support packages designed to make your German university application journey smooth and successful
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <Shield className="h-4 w-4 mr-2" />
                95% Success Rate
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <Clock className="h-4 w-4 mr-2" />
                5+ Years Experience
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                <Star className="h-4 w-4 mr-2" />
                500+ Students Helped
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Consultation Packages */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Consultation Packages
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the package that best fits your needs and budget. All packages include access to our platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {consultationPackages.map((pkg, index) => (
              <Card key={index} className={`relative ${pkg.popular ? 'ring-2 ring-primary shadow-xl scale-105' : ''}`}>
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2">{pkg.name}</CardTitle>
                  <div className="text-4xl font-bold text-primary mb-2">{pkg.price}</div>
                  <p className="text-muted-foreground text-sm">{pkg.duration}</p>
                  <CardDescription className="mt-4">{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-3 flex items-center">
                      <Check className="h-4 w-4 mr-2" />
                      Included Features
                    </h4>
                    <ul className="space-y-2">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {pkg.limitations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-muted-foreground mb-3">
                        Limitations
                      </h4>
                      <ul className="space-y-2">
                        {pkg.limitations.map((limitation, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-red-500">×</span>
                            {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <Button className="w-full" variant={pkg.popular ? "default" : "outline"} asChild>
                    <Link to="/auth">
                      Choose {pkg.name}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Services */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Service Details
            </h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive breakdown of what's included in each service area
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Features:</h4>
                      <ul className="space-y-1">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Available in:</h4>
                      <div className="flex flex-wrap gap-2">
                        {service.included.map((pkg, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {pkg}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join hundreds of students who have successfully secured admission to German universities
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/auth">Get Started Today</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary" asChild>
                <Link to="#contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
