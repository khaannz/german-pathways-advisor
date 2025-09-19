import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, MessageSquare, User, Mail, Clock, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  user_id?: string | null;
  created_at: string;
  updated_at: string;
}

interface ContactMessageComment {
  id: string;
  contact_message_id: string;
  user_id: string;
  comment: string;
  created_at: string;
}

interface ContactMessagesProps {
  className?: string;
}

export const ContactMessages = ({ className }: ContactMessagesProps) => {
  const { user, isEmployee } = useAuth();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [comments, setComments] = useState<ContactMessageComment[]>([]);
  const [responseText, setResponseText] = useState("");
  const [responding, setResponding] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isEmployee) {
      fetchContactMessages();
    }
  }, [isEmployee]);

  const fetchContactMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .is('user_id', null) // Only fetch anonymous contact messages
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages((data as ContactMessage[]) || []);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      toast.error("Failed to load contact messages");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (messageId: string) => {
    try {
      const { data, error } = await supabase
        .from('contact_message_comments')
        .select('*')
        .eq('contact_message_id', messageId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleViewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setShowModal(true);
    await fetchComments(message.id);
  };

  const handleRespond = async () => {
    if (!selectedMessage || !responseText.trim() || !user) return;

    setResponding(true);
    try {
      // Add comment
      const { error: commentError } = await supabase
        .from('contact_message_comments')
        .insert({
          contact_message_id: selectedMessage.id,
          user_id: user.id,
          comment: responseText.trim()
        });

      if (commentError) throw commentError;

      // Update message status to resolved
      const { error: updateError } = await supabase
        .from('contact_messages')
        .update({ status: 'resolved' })
        .eq('id', selectedMessage.id);

      if (updateError) throw updateError;

      toast.success("Response sent successfully");
      setResponseText("");
      setShowModal(false);
      fetchContactMessages();
    } catch (error) {
      console.error('Error responding to message:', error);
      toast.error("Failed to send response");
    } finally {
      setResponding(false);
    }
  };

  const handleUpdateStatus = async (messageId: string, newStatus: 'open' | 'resolved') => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: newStatus })
        .eq('id', messageId);

      if (error) throw error;

      toast.success(`Message marked as ${newStatus}`);
      fetchContactMessages();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("Failed to update status");
    }
  };

  if (!isEmployee) {
    return null;
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const openMessages = messages.filter(msg => msg.status === 'open');
  const resolvedMessages = messages.filter(msg => msg.status === 'resolved');

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Contact Messages (Anonymous Users)
          </CardTitle>
          <CardDescription>
            Manage contact form submissions from anonymous website visitors (not registered users).
          </CardDescription>
          <div className="flex gap-2">
            <Badge variant="destructive">{openMessages.length} Open</Badge>
            <Badge variant="secondary">{resolvedMessages.length} Resolved</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No contact messages yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <Card key={message.id} className="border-l-4 border-l-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1">
                        <h4 className="font-semibold">{message.subject}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {message.name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />
                            {message.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {format(new Date(message.created_at), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                      <Badge variant={message.status === 'open' ? 'destructive' : 'secondary'}>
                        {message.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {message.message}
                    </p>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewMessage(message)}
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        View & Respond
                      </Button>
                      {message.status === 'open' ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleUpdateStatus(message.id, 'resolved')}
                        >
                          Mark Resolved
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleUpdateStatus(message.id, 'open')}
                        >
                          Reopen
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact Message Details</DialogTitle>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Subject: {selectedMessage.subject}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {selectedMessage.name}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {selectedMessage.email}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span> {format(new Date(selectedMessage.created_at), 'PPp')}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> 
                      <Badge variant={selectedMessage.status === 'open' ? 'destructive' : 'secondary'} className="ml-2">
                        {selectedMessage.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Message:</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>
              </div>

              {comments.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Previous Responses:</h4>
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-muted/50 p-3 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">
                          Employee response - {format(new Date(comment.created_at), 'PPp')}
                        </div>
                        <p className="whitespace-pre-wrap">{comment.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-medium">Add Response:</h4>
                <Textarea
                  placeholder="Type your response here..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={4}
                />
                <div className="flex gap-3">
                  <Button
                    onClick={handleRespond}
                    disabled={!responseText.trim() || responding}
                  >
                    {responding ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      'Send Response'
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setShowModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};