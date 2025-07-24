import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-primary to-accent p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">EduPath Germany</h3>
                <p className="text-sm text-background/70">Your Gateway to German Universities</p>
              </div>
            </div>
            <p className="text-background/80 leading-relaxed">
              We are dedicated to helping international students achieve their dreams of studying in Germany's world-renowned universities.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" className="text-background hover:bg-background/10">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-background hover:bg-background/10">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-background hover:bg-background/10">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-background hover:bg-background/10">
                <Linkedin className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Services</h4>
            <ul className="space-y-2 text-background/80">
              <li><a href="#" className="hover:text-background transition-colors">University Applications</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Visa Assistance</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Scholarship Guidance</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Course Selection</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Pre-Departure Support</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Post-Arrival Services</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-background/80">
              <li><a href="#about" className="hover:text-background transition-colors">About Us</a></li>
              <li><a href="#services" className="hover:text-background transition-colors">Our Services</a></li>
              <li><a href="#testimonials" className="hover:text-background transition-colors">Success Stories</a></li>
              <li><a href="#contact" className="hover:text-background transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-background transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-background transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Info</h4>
            <div className="space-y-3 text-background/80">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4" />
                <span>+49 (0) 30 1234 5678</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4" />
                <span>info@edupath-germany.com</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-1" />
                <span>Friedrichstraße 123<br />10117 Berlin, Germany</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-background/5 rounded-lg">
              <h5 className="font-medium mb-2">Office Hours</h5>
              <div className="text-sm text-background/80">
                <div>Mon - Fri: 9:00 AM - 6:00 PM</div>
                <div>Sat: 10:00 AM - 2:00 PM</div>
                <div>Sun: Closed</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/60 text-sm">
              © 2024 EduPath Germany. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-background/60">
              <a href="#" className="hover:text-background transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-background transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-background transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;