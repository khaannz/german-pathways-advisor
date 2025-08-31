import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, Calendar, Users, CheckCircle, Clock, Reply, Send, Trash2, Filter, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Enquiry } from '@/types/enquiries';
import EnquiryComments from './EnquiryComments';


interface EnquiryManagementProps {
  userId?: string; // If provided, show only this user's enquiries
  className?: string;
  currentUserId?: string;
  isEmployee?: boolean;
}

const EnquiryManagement: React.FC<EnquiryManagementProps> = ({ 
  userId, 
  className, 
  currentUserId, 
  isEmployee = false 
}) => {
  const { toast } = useToast();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isRespondingToEnquiry, setIsRespondingToEnquiry] = useState(false);
  const [showComments, setShowComments] = useState<string | null>(null);

  useEffect(() => {
    fetchEnquiries();
  }, [userId]);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setEnquiries((data as Enquiry[]) || []);
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      toast({
        title: "Error",
        description: "Failed to load enquiries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToEnquiry = async (enquiryId: string, response: string) => {
    if (!response.trim()) {
      toast({ title: "Error", description: "Please enter a response", variant: "destructive" });
      return;
    }

    setIsRespondingToEnquiry(true);
    try {
      // Add comment instead of updating enquiry
      const { error: commentError } = await supabase
        .from('enquiry_comments')
        .insert({
          enquiry_id: enquiryId,
          user_id: currentUserId!,
          comment: response.trim(),
        });

      if (commentError) throw commentError;

      // Update enquiry status to resolved
      const { error: statusError } = await supabase
        .from('enquiries')
        .update({
          status: 'resolved',
          updated_at: new Date().toISOString()
        })
        .eq('id', enquiryId);

      if (statusError) throw statusError;

      toast({ title: "Success", description: "Response sent successfully" });
      setResponseText('');
      setSelectedEnquiry(null);
      fetchEnquiries();
    } catch (error) {
      console.error('Error responding to enquiry:', error);
      toast({ title: "Error", description: "Failed to send response", variant: "destructive" });
    } finally {
      setIsRespondingToEnquiry(false);
    }
  };

  const handleDeleteEnquiry = async (enquiryId: string) => {
    try {
      const { error } = await supabase
        .from('enquiries')
        .delete()
        .eq('id', enquiryId);

      if (error) throw error;

      toast({ title: "Success", description: "Enquiry deleted successfully" });
      fetchEnquiries();
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      toast({ title: "Error", description: "Failed to delete enquiry", variant: "destructive" });
    }
  };

  const handleUpdateStatus = async (enquiryId: string, newStatus: 'open' | 'resolved') => {
    try {
      const { error } = await supabase
        .from('enquiries')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', enquiryId);

      if (error) throw error;

      toast({ title: "Success", description: "Status updated successfully" });
      fetchEnquiries();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const filteredEnquiries = enquiries.filter(enquiry => 
    filterStatus === 'all' || enquiry.status === filterStatus
  );

  const pendingCount = enquiries.filter(e => e.status === 'open').length;

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading enquiries...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            {userId ? 'Student Enquiries' : 'All Enquiries'}
          </h2>
          <p className="text-muted-foreground">
            {userId ? 'Manage enquiries from this student' : 'Manage and respond to all student enquiries'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {!userId && (
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Enquiries</SelectItem>
                <SelectItem value="open">Open Only</SelectItem>
                <SelectItem value="resolved">Resolved Only</SelectItem>
              </SelectContent>
            </Select>
          )}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1">
              {filteredEnquiries.length} total
            </Badge>
            {pendingCount > 0 && (
              <Badge variant="destructive" className="px-3 py-1">
                {pendingCount} pending
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Enquiries List */}
      <div className="space-y-4">
        {filteredEnquiries.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Enquiries Found</h3>
              <p className="text-muted-foreground">
                {filterStatus === 'all' 
                  ? "No enquiries have been submitted yet." 
                  : `No ${filterStatus} enquiries found.`
                }
              </p>
            </div>
          </Card>
        ) : (
          filteredEnquiries.map((enquiry) => (
            <Card key={enquiry.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{enquiry.subject}</h3>
                      <Badge variant={enquiry.status === 'resolved' ? 'default' : 'secondary'}>
                        {enquiry.status === 'resolved' ? (
                          <><CheckCircle className="h-3 w-3 mr-1" /> Resolved</>
                        ) : (
                          <><Clock className="h-3 w-3 mr-1" /> Open</>
                        )}
                      </Badge>
                      {enquiry.status === 'open' && (
                        <Badge variant="destructive" className="animate-pulse">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Needs Response
                        </Badge>
                      )}
                    </div>
                    {!userId && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">{enquiry.profiles?.full_name}</span>
                        <span>•</span>
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(enquiry.created_at), 'MMM dd, yyyy • HH:mm')}</span>
                      </div>
                    )}
                    {userId && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(enquiry.created_at), 'MMM dd, yyyy • HH:mm')}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowComments(enquiry.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Comments
                    </Button>
                    {isEmployee && enquiry.status === 'open' && (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" onClick={() => {
                              setSelectedEnquiry(enquiry);
                              setResponseText('');
                            }}>
                              <Reply className="h-4 w-4 mr-2" />
                              Respond
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Respond to Enquiry</DialogTitle>
                              <DialogDescription>
                                Provide a helpful response to {enquiry.profiles?.full_name}'s enquiry
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="p-4 bg-secondary/30 rounded-lg">
                                <h4 className="font-medium mb-2">{enquiry.subject}</h4>
                                <p className="text-sm text-muted-foreground">{enquiry.message}</p>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="response">Your Response</Label>
                                <Textarea
                                  id="response"
                                  placeholder="Type your response here..."
                                  value={responseText}
                                  onChange={(e) => setResponseText(e.target.value)}
                                  className="min-h-32"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setSelectedEnquiry(null)}>
                                Cancel
                              </Button>
                              <Button
                                onClick={() => handleRespondToEnquiry(enquiry.id, responseText)}
                                disabled={isRespondingToEnquiry || !responseText.trim()}
                              >
                                {isRespondingToEnquiry ? (
                                  <>
                                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Response
                                  </>
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(enquiry.id, 'resolved')}
                        >
                          Mark Resolved
                        </Button>
                      </>
                    )}
                    {isEmployee && enquiry.status === 'resolved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(enquiry.id, 'open')}
                      >
                        Reopen
                      </Button>
                    )}
                    {isEmployee && (
                      <Button variant="outline" size="sm" onClick={() => handleDeleteEnquiry(enquiry.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="p-4 bg-secondary/20 rounded-lg">
                    <p className="text-sm leading-relaxed">{enquiry.message}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Comments Modal */}
      {showComments && currentUserId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed inset-0 overflow-auto">
            <EnquiryComments 
              enquiry={filteredEnquiries.find(e => e.id === showComments)!}
              currentUserId={currentUserId}
              isEmployee={isEmployee}
              onClose={() => setShowComments(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EnquiryManagement;

