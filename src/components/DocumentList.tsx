import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  ExternalLink, 
  Trash2, 
  Calendar,
  File,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

interface Document {
  id: string;
  type: string;
  title: string;
  file_url: string | null;
  file_path: string | null;
  drive_link: string | null;
  file_name: string | null;
  file_size: number | null;
  created_at: string;
}

interface DocumentListProps {
  refresh?: number;
}

const DocumentList: React.FC<DocumentListProps> = ({ refresh }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDocuments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      toast({
        title: "Failed to load documents",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user, refresh]);

  const handleDownload = async (doc: Document) => {
    const derivePath = (): string | null => {
      if (doc.file_path) return doc.file_path;
      if (doc.file_url) {
        try {
          const u = new URL(doc.file_url);
          const parts = u.pathname.split('/');
          const idx = parts.findIndex((p) => p === 'documents');
          if (idx !== -1) return parts.slice(idx + 1).join('/');
          // Fallback: last two segments
          return parts.slice(-2).join('/');
        } catch {
          return null;
        }
      }
      return null;
    };

    const path = derivePath();
    if (!path) {
      toast({ title: 'Download failed', description: 'No file path available', variant: 'destructive' });
      return;
    }

    try {
      const { data, error } = await supabase.storage.from('documents').download(path);
      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name || doc.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({ title: 'Download failed', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    setDeletingId(doc.id);

    try {
      // Delete file from storage if it exists
      {
        const path = doc.file_path
          ? doc.file_path
          : (doc.file_url ? (() => {
              try {
                const u = new URL(doc.file_url!);
                const parts = u.pathname.split('/');
                const idx = parts.findIndex((p) => p === 'documents');
                return idx !== -1 ? parts.slice(idx + 1).join('/') : parts.slice(-2).join('/');
              } catch {
                return null;
              }
            })() : null);

        if (path) {
          await supabase.storage.from('documents').remove([path]);
        }
      }

      // Delete record from database
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id);

      if (error) throw error;

      setDocuments(prev => prev.filter(d => d.id !== doc.id));
      toast({
        title: "Document deleted",
        description: "Document has been removed successfully"
      });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SOP': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'LOR': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'CV': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'transcript': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading documents...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          My Documents ({documents.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No documents uploaded yet</p>
            <p className="text-sm">Upload your first document to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{doc.title}</h3>
                      <Badge className={getTypeColor(doc.type)}>
                        {doc.type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(doc.created_at), 'MMM dd, yyyy')}
                      </div>
                      {doc.file_size && (
                        <span>{formatFileSize(doc.file_size)}</span>
                      )}
                    </div>

                    {doc.file_name && (
                      <p className="text-sm text-muted-foreground">
                        File: {doc.file_name}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {(doc.file_path || doc.file_url) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {doc.drive_link && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={doc.drive_link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(doc)}
                      disabled={deletingId === doc.id}
                      className="text-destructive hover:text-destructive"
                    >
                      {deletingId === doc.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentList;