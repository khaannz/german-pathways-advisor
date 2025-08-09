import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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
            <Link to="/services" className="text-foreground hover:text-primary transition-colors">Services</Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors">About</Link>
            <Link to="/success-stories" className="text-foreground hover:text-primary transition-colors">Success Stories</Link>
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
                  {!isEmployee && (
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {!isEmployee && (
                    <DropdownMenuItem asChild>
                      <Link to="/questionnaire" className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Application Questionnaire
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {!isEmployee && (
                    <DropdownMenuItem asChild>
                      <Link to="/documents" className="flex items-center">
                        <Upload className="h-4 w-4 mr-2" />
                        My Documents
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {!isEmployee && (
                    <DropdownMenuItem asChild>
                      <Link to="/enquiries" className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contact Support
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isEmployee && (
                    <DropdownMenuItem asChild>
                      <Link to="/employee-dashboard" className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Employee Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="hero" size="sm" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;