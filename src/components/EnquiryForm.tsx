import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Send, Loader2 } from 'lucide-react';

interface EnquiryFormProps {
  onSuccess?: () => void;
}

const EnquiryForm: React.FC<EnquiryFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both subject and message",
        variant: "destructive"
      });
      return;
    }

    if (formData.subject.trim().length < 5) {
      toast({
        title: "Subject too short",
        description: "Subject must be at least 5 characters long",
        variant: "destructive"
      });
      return;
    }

    if (formData.message.trim().length < 10) {
      toast({
        title: "Message too short",
        description: "Message must be at least 10 characters long",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('enquiries')
        .insert({
          user_id: user.id,
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          status: 'open'
        });

      if (error) throw error;

      toast({
        title: "Enquiry submitted successfully",
        description: "We will get back to you soon"
      });

      setFormData({ subject: '', message: '' });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error submitting enquiry:', error);
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit enquiry",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Submit an Enquiry
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Enter subject of your enquiry"
              required
            />
          </div>

          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Describe your query or concern in detail"
              rows={6}
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Enquiry
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EnquiryForm;