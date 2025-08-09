import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Users, 
  Award, 
  MapPin, 
  Calendar,
  Heart,
  Target,
  TrendingUp,
  Globe,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  const stats = [
    { icon: Users, label: "Students Helped", value: "500+", description: "Successfully placed in German universities" },
    { icon: Award, label: "Success Rate", value: "95%", description: "University admission success rate" },
    { icon: Calendar, label: "Years Experience", value: "5+", description: "In German education consulting" },
    { icon: Globe, label: "Universities", value: "100+", description: "Partner universities across Germany" }
  ];

  const team = [
    {
      name: "Dr. Sarah Mueller",
      role: "Founder & Lead Consultant", 
      education: "PhD in Education, University of Berlin",
      experience: "8 years in international education",
      specialties: ["PhD Applications", "Research Programs", "Academic Counseling"]
    },
    {
      name: "Ahmed Hassan",
      role: "Senior Consultant",
      education: "MS Computer Science, TU Munich", 
      experience: "5 years in STEM consulting",
      specialties: ["Engineering Programs", "Computer Science", "Technical Applications"]
    },
    {
      name: "Maria Rodriguez",
      role: "Visa & Documentation Expert",
      education: "LLM International Law, University of Cologne",
      experience: "6 years in immigration law",
      specialties: ["Visa Applications", "Legal Documentation", "Immigration Support"]
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Student-Centric Approach",
      description: "Every decision we make is centered around what's best for our students' future and success."
    },
    {
      icon: Target,
      title: "Goal-Oriented",
      description: "We focus on concrete outcomes and measurable results in university admissions."
    },
    {
      icon: TrendingUp,
      title: "Continuous Improvement",
      description: "We constantly update our methods based on the latest admission trends and requirements."
    }
  ];

  const milestones = [
    { year: "2019", event: "EduPath Germany founded with a vision to democratize German education access" },
    { year: "2020", event: "Reached 100+ successful university placements despite pandemic challenges" },
    { year: "2021", event: "Launched comprehensive digital platform for streamlined applications" },
    { year: "2022", event: "Expanded to cover all major German cities and universities" },
    { year: "2023", event: "Achieved 95% success rate milestone and 500+ students helped" },
    { year: "2024", event: "Introduced AI-powered university matching and application optimization" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              About EduPath Germany
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              We are passionate about making German university education accessible to students worldwide. 
              Our mission is to guide, support, and empower students throughout their entire journey.
            </p>
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-primary to-accent p-3 rounded-2xl">
                <GraduationCap className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                    <h3 className="font-semibold text-foreground mb-2">{stat.label}</h3>
                    <p className="text-sm text-muted-foreground">{stat.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Story</h2>
              <p className="text-lg text-muted-foreground">
                How we started and where we're going
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-foreground">From Personal Experience to Professional Mission</h3>
                <p className="text-muted-foreground">
                  EduPath Germany was born from the founder's own challenging experience navigating the German university application process. After struggling with complex requirements, language barriers, and bureaucratic procedures, our founder realized thousands of talented students face similar obstacles.
                </p>
                <p className="text-muted-foreground">
                  What started as helping a few friends has grown into a comprehensive consultancy that has successfully guided over 500 students to their dream universities across Germany.
                </p>
                <p className="text-muted-foreground">
                  Today, we combine deep knowledge of the German education system with cutting-edge technology to provide personalized, efficient, and effective guidance to students worldwide.
                </p>
              </div>
              
              <div className="space-y-4">
                <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
                  <h4 className="font-semibold text-foreground mb-3">Our Mission</h4>
                  <p className="text-muted-foreground">
                    To make German university education accessible to talented students worldwide by providing expert guidance, personalized support, and innovative tools that simplify the application process.
                  </p>
                </Card>
                
                <Card className="p-6 bg-gradient-to-br from-accent/5 to-primary/5">
                  <h4 className="font-semibold text-foreground mb-3">Our Vision</h4>
                  <p className="text-muted-foreground">
                    To become the leading platform that connects global talent with German educational opportunities, fostering international academic exchange and career growth.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Journey</h2>
              <p className="text-lg text-muted-foreground">
                Key milestones in our growth and evolution
              </p>
            </div>
            
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                      {milestone.year.slice(-2)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border">
                      <h3 className="font-bold text-primary mb-2">{milestone.year}</h3>
                      <p className="text-muted-foreground">{milestone.event}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="text-center h-full">
                  <CardContent className="pt-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-4">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Expert Team</h2>
            <p className="text-lg text-muted-foreground">
              Meet the professionals dedicated to your success
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {team.map((member, index) => (
              <Card key={index}>
                <CardHeader className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-12 w-12 text-white" />
                  </div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <CardDescription className="text-primary font-semibold">{member.role}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-1">Education</h4>
                    <p className="text-sm text-muted-foreground">{member.education}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-1">Experience</h4>
                    <p className="text-sm text-muted-foreground">{member.experience}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {member.specialties.map((specialty, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join Our Success Stories
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Let us help you achieve your dream of studying in Germany
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/auth">Start Your Journey</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary" asChild>
                <Link to="#contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
