import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Priya Sharma",
      country: "India",
      university: "Technical University of Munich",
      program: "Master's in Computer Science",
      image: "PS",
      rating: 5,
      text: "EduPath Germany made my dream of studying at TUM come true! Their guidance through the application process was invaluable, and they helped me secure a scholarship too. I couldn't have done it without their expertise."
    },
    {
      name: "Ahmed Hassan",
      country: "Egypt",
      university: "University of Stuttgart",
      program: "Master's in Mechanical Engineering",
      image: "AH",
      rating: 5,
      text: "The team provided exceptional support from application to visa processing. They were always available to answer my questions and made the entire process stress-free. Highly recommended!"
    },
    {
      name: "Maria Rodriguez",
      country: "Spain",
      university: "Humboldt University Berlin",
      program: "Master's in International Relations",
      image: "MR",
      rating: 5,
      text: "Professional, knowledgeable, and caring - that's how I'd describe EduPath Germany. They helped me navigate the complex German university system and I'm now thriving in Berlin!"
    },
    {
      name: "David Chen",
      country: "China",
      university: "RWTH Aachen University",
      program: "Master's in Electrical Engineering",
      image: "DC",
      rating: 5,
      text: "From choosing the right university to preparing for my visa interview, every step was handled professionally. The success rate speaks for itself - they truly know what they're doing."
    },
    {
      name: "Sarah Johnson",
      country: "USA",
      university: "University of Heidelberg",
      program: "PhD in Biochemistry",
      image: "SJ",
      rating: 5,
      text: "The personalized attention and expert advice I received was outstanding. They understood my research interests and helped me find the perfect PhD program and supervisor in Germany."
    },
    {
      name: "Ravi Patel",
      country: "India",
      university: "Frankfurt School of Finance",
      program: "Master's in Finance",
      image: "RP",
      rating: 5,
      text: "EduPath Germany's scholarship guidance was incredible. They helped me secure funding that covers 80% of my tuition. Their knowledge of the German education system is unmatched."
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Star className="h-4 w-4" />
            Success Stories
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
            What Our Students 
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Say About Us</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Don't just take our word for it. Here's what our successful students have to say 
            about their journey with EduPath Germany.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 h-full bg-gradient-to-br from-card to-card/50 border-border/50 hover:shadow-lg transition-all duration-300 group">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 bg-gradient-to-r from-primary to-accent text-white font-semibold flex items-center justify-center">
                    {testimonial.image}
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.country}</p>
                  </div>
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <Quote className="absolute -top-2 -left-2 h-8 w-8 text-primary/20" />
                  <p className="text-muted-foreground leading-relaxed pl-6">
                    {testimonial.text}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <div className="font-medium text-foreground text-sm">{testimonial.university}</div>
                  <div className="text-xs text-muted-foreground">{testimonial.program}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-success/10 to-primary/10 rounded-2xl p-8">
            <div className="text-3xl font-bold text-foreground mb-2">500+</div>
            <div className="text-muted-foreground">Students Successfully Placed in German Universities</div>
            <div className="flex justify-center gap-8 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">95%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">4.9/5</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Partner Universities</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;