import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import Header from '@/components/Header';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentList from '@/components/DocumentList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Upload, FolderOpen, Shield } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <FolderOpen className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Document Management
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Securely upload and manage your academic documents including SOPs, LORs, CVs, and transcripts. 
              All documents are encrypted and stored safely.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Your documents are protected with enterprise-grade security</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 opacity-80" />
                  <div>
                    <p className="text-sm opacity-90">Total Documents</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Upload className="h-8 w-8 opacity-80" />
                  <div>
                    <p className="text-sm opacity-90">Recent Uploads</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-8 w-8 opacity-80" />
                  <div>
                    <p className="text-sm opacity-90">Storage Used</p>
                    <p className="text-2xl font-bold">0 MB</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 opacity-80" />
                  <div>
                    <p className="text-sm opacity-90">Security Level</p>
                    <p className="text-2xl font-bold">High</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="upload" className="space-y-6">
            <div className="flex justify-center">
              <TabsList className="grid w-full max-w-md grid-cols-2 h-12">
                <TabsTrigger value="upload" className="flex items-center gap-2 text-sm">
                  <Upload className="h-4 w-4" />
                  Upload Documents
                </TabsTrigger>
                <TabsTrigger value="manage" className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4" />
                  My Documents
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="upload" className="mt-8">
              <div className="max-w-4xl mx-auto">
                <DocumentUpload onSuccess={handleUploadSuccess} />
              </div>
            </TabsContent>

            <TabsContent value="manage" className="mt-8">
              <div className="max-w-6xl mx-auto">
                <DocumentList refresh={refreshKey} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Documents;