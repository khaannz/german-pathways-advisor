import React, { useState, useRef } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Link, Loader2, FileText, X } from 'lucide-react';

interface DocumentUploadProps {
  onSuccess?: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    driveLink: '',
    file: null as File | null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
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
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, file: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${user!.id}/${fileName}`;

    console.log('Uploading file:', { filePath, fileName, fileSize: file.size });

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    console.log('File uploaded successfully to path:', filePath);
    return filePath;
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

    if (!formData.file) {
      toast({
        title: "No file uploaded",
        description: "Please upload a document file",
        variant: "destructive"
      });
      return;
    }

    // Validate drive link if provided
    if (formData.driveLink && formData.driveLink.trim()) {
      try {
        new URL(formData.driveLink.trim());
      } catch {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid drive link",
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);

    try {
      let filePath: string | null = null;
      let fileUrl: string | null = null;
      let fileName: string | null = null;
      let fileSize: number | null = null;
      let mimeType: string | null = null;

      if (formData.file) {
        console.log('Starting file upload...');
        filePath = await uploadFile(formData.file);
        fileName = formData.file.name;
        fileSize = formData.file.size;
        mimeType = formData.file.type;
        
        // For security, we'll store the path and generate signed URLs when needed
        // instead of storing a permanent public URL
        fileUrl = null; // Will be generated dynamically when accessing
      }

      console.log('Inserting document record:', {
        user_id: user.id,
        type: formData.type,
        title: formData.title.trim(),
        file_path: filePath,
        file_url: fileUrl,
        drive_link: formData.driveLink?.trim() || null
      });

      const { error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          type: formData.type,
          title: formData.title.trim(),
          file_url: fileUrl,
          file_path: filePath,
          drive_link: formData.driveLink?.trim() || null,
          file_name: fileName,
          file_size: fileSize,
          mime_type: mimeType
        });

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }

      console.log('Document saved successfully');
      toast({
        title: "Document uploaded successfully",
        description: "Your document has been saved"
      });

      // Reset form
      setFormData({
        type: '',
        title: '',
        driveLink: '',
        file: null
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Upload process failed:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document. Please check the console for details.",
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
            <Label className="text-base font-medium">Upload File (PDF/DOC) *</Label>
            <div
              className={`relative mt-2 border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                dragActive
                  ? 'border-primary bg-primary/5 scale-[1.02]'
                  : 'border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500'
              } ${formData.file ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {!formData.file ? (
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <Upload className="h-8 w-8 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Drop your file here, or{' '}
                      <button
                        type="button"
                        onClick={openFileSelector}
                        className="text-primary hover:text-primary/80 underline font-medium"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Supports PDF, DOC, DOCX up to 10MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-green-700 dark:text-green-300 mb-1">
                      {formData.file.name}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 mb-3">
                      {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={openFileSelector}
                        className="text-sm text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 underline"
                      >
                        Change file
                      </button>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                      >
                        <X className="h-3 w-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="text-center text-muted-foreground">
            OR (Optional)
          </div>

          <div>
            <Label htmlFor="driveLink" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Google Drive / OneDrive Link (Optional)
            </Label>
            <Textarea
              id="driveLink"
              value={formData.driveLink}
              onChange={(e) => setFormData(prev => ({ ...prev, driveLink: e.target.value }))}
              placeholder="Optionally, paste your Google Drive or OneDrive sharing link here"
              rows={3}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Uploading Document...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Upload Document
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;