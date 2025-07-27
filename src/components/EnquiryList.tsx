import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Calendar,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

interface Enquiry {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  created_at: string;
}

interface EnquiryListProps {
  refresh?: number;
}

const EnquiryList: React.FC<EnquiryListProps> = ({ refresh }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnquiries = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEnquiries((data || []) as Enquiry[]);
    } catch (error: any) {
      toast({
        title: "Failed to load enquiries",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [user, refresh]);

  const getStatusColor = (status: string) => {
    return status === 'resolved' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  };

  const getStatusIcon = (status: string) => {
    return status === 'resolved' ? CheckCircle : Clock;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading enquiries...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          My Enquiries ({enquiries.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {enquiries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No enquiries submitted yet</p>
            <p className="text-sm">Submit your first enquiry to get help</p>
          </div>
        ) : (
          <div className="space-y-4">
            {enquiries.map((enquiry) => {
              const StatusIcon = getStatusIcon(enquiry.status);
              return (
                <div key={enquiry.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium">{enquiry.subject}</h3>
                    <Badge className={getStatusColor(enquiry.status)}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {enquiry.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {enquiry.message}
                  </p>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(enquiry.created_at), 'MMM dd, yyyy • HH:mm')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnquiryList;