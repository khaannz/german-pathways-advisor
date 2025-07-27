import { Button } from "@/components/ui/button";
import { GraduationCap, Phone, Mail, LogOut, User, FileText, Upload, MessageSquare } from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user, signOut, isEmployee } = useAuth();
  return (
    <header className="w-full bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-primary to-accent p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">EduPath Germany</h1>
              <p className="text-xs text-muted-foreground">Your Gateway to German Universities</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#services" className="text-foreground hover:text-primary transition-colors">Services</a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors">About</a>
            <a href="#testimonials" className="text-foreground hover:text-primary transition-colors">Success Stories</a>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors">Contact</a>
          </nav>
          
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-4 text-sm text-muted-foreground mr-4">
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span>+49 xxx xxxx</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>info@edupath.de</span>
              </div>
            </div>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <a href="/dashboard" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/questionnaire" className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Document Questionnaire
                    </a>
                  </DropdownMenuItem>
                  {!isEmployee && (
                    <DropdownMenuItem asChild>
                      <a href="/questionnaire" className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Application Questionnaire
                      </a>
                    </DropdownMenuItem>
                  )}
                  {!isEmployee && (
                    <DropdownMenuItem asChild>
                      <a href="/documents" className="flex items-center">
                        <Upload className="h-4 w-4 mr-2" />
                        My Documents
                      </a>
                    </DropdownMenuItem>
                  )}
                  {!isEmployee && (
                    <DropdownMenuItem asChild>
                      <a href="/enquiries" className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact Support
                      </a>
                    </DropdownMenuItem>
                  )}
                  {isEmployee && (
                    <DropdownMenuItem asChild>
                      <a href="/employee-dashboard" className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Employee Dashboard
                      </a>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="hero" size="sm" asChild>
                <a href="/auth">Sign In</a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;