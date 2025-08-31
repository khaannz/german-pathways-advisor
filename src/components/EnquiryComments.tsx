import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Trash2, User, UserCheck, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Enquiry, EnquiryComment } from '@/types/enquiries';

interface EnquiryCommentsProps {
  enquiry: Enquiry;
  currentUserId: string;
  isEmployee: boolean;
  onClose: () => void;
}

const EnquiryComments: React.FC<EnquiryCommentsProps> = ({ 
  enquiry, 
  currentUserId, 
  isEmployee,
  onClose 
}) => {
  const { toast } = useToast();
  const [comments, setComments] = useState<EnquiryComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [enquiry.id]);

  const loadComments = async () => {
    try {
      setLoading(true);
      
      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('enquiry_comments')
        .select('*')
        .eq('enquiry_id', enquiry.id)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // Fetch profiles for comment authors
      if (commentsData && commentsData.length > 0) {
        const userIds = [...new Set(commentsData.map(c => c.user_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, role')
          .in('user_id', userIds);

        if (profilesError) throw profilesError;

        // Map profiles to comments
        const commentsWithProfiles = commentsData.map(comment => ({
          ...comment,
          profiles: profilesData?.find(p => p.user_id === comment.user_id) || null
        }));

        setComments(commentsWithProfiles as EnquiryComment[]);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('enquiry_comments')
        .insert({
          enquiry_id: enquiry.id,
          user_id: currentUserId,
          comment: newComment.trim(),
        });

      if (error) throw error;

      setNewComment('');
      await loadComments();
      
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('enquiry_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      await loadComments();
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy • HH:mm');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'open': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{enquiry.subject}</h1>
            <Badge className={getStatusColor(enquiry.status)}>
              {enquiry.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{enquiry.profiles?.full_name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDate(enquiry.created_at)}</span>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Original Enquiry */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            Original Enquiry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-secondary/20 rounded-lg">
            <p className="text-sm leading-relaxed">{enquiry.message}</p>
          </div>
        </CardContent>
      </Card>

      {/* Comments Thread */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No comments yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <div key={comment.id} className="space-y-3">
                  <div className="flex items-start justify-between p-4 bg-background border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {comment.profiles?.role === 'employee' ? (
                            <UserCheck className="h-4 w-4 text-primary" />
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="font-medium text-sm">
                            {comment.profiles?.full_name}
                          </span>
                          {comment.profiles?.role === 'employee' && (
                            <Badge variant="secondary" className="text-xs">
                              Employee
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{comment.comment}</p>
                    </div>
                    {(comment.user_id === currentUserId || isEmployee) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment Form */}
          <div className="border-t pt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Add a comment</label>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Type your comment here..."
                className="min-h-20"
              />
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitComment}
                disabled={submitting || !newComment.trim()}
                size="sm"
              >
                {submitting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Add Comment
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnquiryComments;