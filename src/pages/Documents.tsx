import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import Header from '@/components/Header';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentList from '@/components/DocumentList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload } from 'lucide-react';

const Documents = () => {
  const { user, loading } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
            <p className="text-muted-foreground">Please sign in to access document management.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Document Management</h1>
            <p className="text-muted-foreground">
              Upload and manage your academic documents including SOPs, LORs, CVs, and transcripts
            </p>
          </div>

          <Tabs defaultValue="upload" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Document
              </TabsTrigger>
              <TabsTrigger value="manage" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                My Documents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload">
              <DocumentUpload onSuccess={handleUploadSuccess} />
            </TabsContent>

            <TabsContent value="manage">
              <DocumentList refresh={refreshKey} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Documents;