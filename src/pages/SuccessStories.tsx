import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Quote,
  GraduationCap,
  MapPin,
  Calendar,
  TrendingUp,
  Award,
  Heart,
  Users
} from 'lucide-react';

const SuccessStories = () => {
  const testimonials = [
    {
      name: "Arjun Patel",
      country: "India",
      program: "MS Computer Science",
      university: "Technical University of Munich",
      year: "2023",
      package: "Premium Package",
      rating: 5,
      image: "👨‍💻",
      story: "EduPath Germany made my dream come true! The team helped me navigate the complex application process and provided excellent guidance for my SOP and LOR. Within 6 months, I received admission to TU Munich with a partial scholarship. The platform made document management so easy, and the consultants were always available to answer my questions.",
      highlights: ["Got 50% scholarship", "Secured accommodation", "Smooth visa process"]
    },
    {
      name: "Maria Santos",
      country: "Brazil", 
      program: "MSc Renewable Energy",
      university: "RWTH Aachen University",
      year: "2023",
      package: "VIP Package",
      rating: 5,
      image: "👩‍🔬",
      story: "The VIP package was worth every penny! My personal consultant guided me through every step, from university selection to post-arrival support. I was particularly impressed with the scholarship application assistance - I received the DAAD scholarship covering my full tuition and living expenses. The team even helped me find housing before I arrived in Germany.",
      highlights: ["DAAD Scholarship recipient", "Housing arranged", "Personal consultant support"]
    },
    {
      name: "Ahmed Hassan",
      country: "Egypt",
      program: "PhD Mechanical Engineering", 
      university: "University of Stuttgart",
      year: "2022",
      package: "Premium Package",
      rating: 5,
      image: "👨‍🎓",
      story: "As a PhD applicant, I needed specialized guidance for research proposals and finding the right supervisor. EduPath's team connected me with professors whose research aligned with my interests. The document preparation was thorough, and they helped me craft a compelling research proposal. I'm now in my second year of PhD with full funding.",
      highlights: ["Full PhD funding", "Research supervisor match", "Publication guidance"]
    },
    {
      name: "Lisa Chen",
      country: "China",
      program: "MBA",
      university: "Frankfurt School of Finance",
      year: "2023", 
      package: "Premium Package",
      rating: 5,
      image: "👩‍💼",
      story: "The business school application process is quite different from engineering programs. EduPath's consultants understood this perfectly and helped me highlight my professional experience effectively. They guided me through the GMAT preparation strategy and interview preparation. I'm now studying at one of Europe's top business schools!",
      highlights: ["Top-tier business school", "Interview preparation", "Professional experience optimization"]
    },
    {
      name: "Raj Kumar",
      country: "India",
      program: "MS Data Science",
      university: "Heidelberg University",
      year: "2024",
      package: "Essential Package",
      rating: 4,
      image: "👨‍💻",
      story: "Even with the Essential package, I received great value. The university shortlisting was spot-on, and the application timeline helped me stay organized. While I had to handle some documents myself, the guidance was clear and the platform was user-friendly. I successfully got admission to my preferred program within budget.",
      highlights: ["Budget-friendly option", "Clear guidance", "Successful admission"]
    },
    {
      name: "Elena Popov",
      country: "Russia",
      program: "MS International Relations",
      university: "University of Cologne",
      year: "2023",
      package: "VIP Package", 
      rating: 5,
      image: "👩‍🎓",
      story: "The political situation made my application complex, but EduPath's team handled everything professionally. They provided guidance on documentation during uncertain times and even helped with emergency visa processing. The post-arrival support was invaluable - they helped me integrate into German academic culture quickly.",
      highlights: ["Complex case handling", "Emergency support", "Cultural integration"]
    }
  ];

  const stats = [
    { icon: Users, label: "Happy Students", value: "500+", color: "text-blue-600" },
    { icon: Award, label: "Success Rate", value: "95%", color: "text-green-600" },
    { icon: GraduationCap, label: "Universities", value: "100+", color: "text-purple-600" },
    { icon: Heart, label: "Satisfaction", value: "4.9/5", color: "text-red-600" }
  ];

  const achievements = [
    {
      title: "Scholarship Success",
      description: "60% of our VIP package students receive scholarships",
      icon: Award,
      stat: "60%"
    },
    {
      title: "Quick Results", 
      description: "Average admission decision within 4 months",
      icon: TrendingUp,
      stat: "4 months"
    },
    {
      title: "Global Reach",
      description: "Students from 50+ countries successfully placed",
      icon: MapPin,
      stat: "50+ countries"
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
              Success Stories
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Real students, real results. See how EduPath Germany has helped students from around the world achieve their German university dreams.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-white shadow-lg flex items-center justify-center`}>
                      <Icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Success Achievements */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Students Choose Us
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our track record speaks for itself. Here's what sets us apart in helping students succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <Card key={index} className="text-center h-full">
                  <CardContent className="pt-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-primary mb-2">{achievement.stat}</div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{achievement.title}</h3>
                    <p className="text-muted-foreground">{achievement.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Student Testimonials
            </h2>
            <p className="text-lg text-muted-foreground">
              Hear directly from our successful students about their experience
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{testimonial.image}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {testimonial.package}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4" />
                        {testimonial.country}
                        <Calendar className="h-4 w-4 ml-2" />
                        {testimonial.year}
                      </div>
                      <CardDescription className="font-medium text-primary">
                        {testimonial.program} at {testimonial.university}
                      </CardDescription>
                      <div className="flex items-center gap-1 mt-2">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Quote className="h-6 w-6 text-primary/20 absolute -top-2 -left-2" />
                    <p className="text-muted-foreground italic pl-4">
                      "{testimonial.story}"
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Key Achievements:</h4>
                    <div className="space-y-1">
                      {testimonial.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-muted-foreground">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Write Your Success Story?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join hundreds of successful students who chose EduPath Germany for their journey
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors">
                Start Your Application
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold py-3 px-8 rounded-lg transition-colors">
                Contact Our Team
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SuccessStories;
