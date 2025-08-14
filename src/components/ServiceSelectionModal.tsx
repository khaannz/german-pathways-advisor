import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  MessageSquare, 
  GraduationCap, 
  FileEdit, 
  Plane,
  Check 
} from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ServiceSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ServiceType = 'sop' | 'lor' | 'university_shortlisting' | 'cover_letter' | 'visa_motivation';

const services: Array<{
  id: ServiceType;
  title: string;
  description: string;
  icon: any;
  route: string;
  price: string;
}> = [
  {
    id: 'sop',
    title: 'Statement of Purpose',
    description: 'Professional SOP writing and consultation',
    icon: FileText,
    route: '/questionnaire/sop',
    price: '$199'
  },
  {
    id: 'lor',
    title: 'Letter of Recommendation',
    description: 'LOR guidance and template creation',
    icon: MessageSquare,
    route: '/questionnaire/lor',
    price: '$149'
  },
  {
    id: 'university_shortlisting',
    title: 'University Shortlisting',
    description: 'Personalized university recommendations',
    icon: GraduationCap,
    route: '/questionnaire/university-shortlisting',
    price: '$299'
  },
  {
    id: 'cover_letter',
    title: 'Cover Letter',
    description: 'Professional cover letter writing',
    icon: FileEdit,
    route: '/questionnaire/cover-letter',
    price: '$129'
  },
  {
    id: 'visa_motivation',
    title: 'Letter of Motivation for German Student Visa',
    description: 'Visa motivation letter for German applications',
    icon: Plane,
    route: '/questionnaire/visa-motivation',
    price: '$179'
  }
];

export const ServiceSelectionModal = ({ open, onOpenChange }: ServiceSelectionModalProps) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [purchasedServices, setPurchasedServices] = useState<string[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleServiceSelect = async (serviceId: ServiceType, route: string) => {
    if (!user) {
      toast.error("Please sign in to access services");
      navigate('/auth');
      return;
    }

    setLoading(serviceId);
    
    try {
      // Check if user already has this service
      const { data: existingService } = await supabase
        .from('user_services')
        .select('*')
        .eq('user_id', user.id)
        .eq('service_type', serviceId)
        .eq('is_active', true)
        .single();

      if (existingService) {
        // User already has access, navigate directly
        navigate(route);
        onOpenChange(false);
      } else {
        // For now, grant immediate access (payment integration can be added later)
        const { error } = await supabase
          .from('user_services')
          .insert({
            user_id: user.id,
            service_type: serviceId,
            is_active: true
          });

        if (error) throw error;

        setPurchasedServices(prev => [...prev, serviceId]);
        toast.success("Service activated! Redirecting...");
        
        setTimeout(() => {
          navigate(route);
          onOpenChange(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Error activating service:', error);
      toast.error("Failed to activate service. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Choose Your Service
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Select the service you need for your German education journey
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {services.map((service) => (
            <Card 
              key={service.id} 
              className="p-4 hover:shadow-lg transition-all duration-300 relative"
            >
              {purchasedServices.includes(service.id) && (
                <Badge className="absolute -top-2 -right-2 bg-green-500">
                  <Check className="h-3 w-3 mr-1" />
                  Activated
                </Badge>
              )}
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-primary to-accent p-2 rounded-lg">
                    <service.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{service.title}</h3>
                    <p className="text-xs text-muted-foreground">{service.price}</p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>
                
                <Button 
                  className="w-full" 
                  onClick={() => handleServiceSelect(service.id, service.route)}
                  disabled={loading === service.id}
                  variant={purchasedServices.includes(service.id) ? "secondary" : "default"}
                >
                  {loading === service.id ? (
                    "Activating..."
                  ) : purchasedServices.includes(service.id) ? (
                    "Access Service"
                  ) : (
                    "Select Service"
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Need all services? Consider our Premium Package for better value.
            <Button variant="link" className="px-2" onClick={() => navigate('/services')}>
              View Packages
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};