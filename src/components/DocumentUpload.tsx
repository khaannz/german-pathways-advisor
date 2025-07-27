import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Link, Loader2 } from 'lucide-react';

interface DocumentUploadProps {
  onSuccess?: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    driveLink: '',
    file: null as File | null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or Word document",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive"
        });
        return;
      }
      
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${user!.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.title || !formData.type) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!formData.file && !formData.driveLink) {
      toast({
        title: "No document provided",
        description: "Please either upload a file or provide a drive link",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      let fileUrl = null;
      let fileName = null;
      let fileSize = null;
      let mimeType = null;

      if (formData.file) {
        fileUrl = await uploadFile(formData.file);
        fileName = formData.file.name;
        fileSize = formData.file.size;
        mimeType = formData.file.type;
      }

      const { error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          type: formData.type,
          title: formData.title,
          file_url: fileUrl,
          drive_link: formData.driveLink || null,
          file_name: fileName,
          file_size: fileSize,
          mime_type: mimeType
        });

      if (error) throw error;

      toast({
        title: "Document uploaded successfully",
        description: "Your document has been saved"
      });

      setFormData({
        type: '',
        title: '',
        driveLink: '',
        file: null
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document",
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
          <Upload className="h-5 w-5" />
          Upload Document
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Document Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOP">Statement of Purpose</SelectItem>
                  <SelectItem value="LOR">Letter of Recommendation</SelectItem>
                  <SelectItem value="CV">CV/Resume</SelectItem>
                  <SelectItem value="transcript">Transcript</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Document Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter document title"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="file">Upload File (PDF/DOC)</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>

          <div className="text-center text-muted-foreground">
            OR
          </div>

          <div>
            <Label htmlFor="driveLink" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Google Drive / OneDrive Link
            </Label>
            <Textarea
              id="driveLink"
              value={formData.driveLink}
              onChange={(e) => setFormData(prev => ({ ...prev, driveLink: e.target.value }))}
              placeholder="Paste your Google Drive or OneDrive sharing link here"
              rows={3}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Document'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;