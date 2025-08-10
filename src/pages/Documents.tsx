import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentList from '@/components/DocumentList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Upload, 
  Shield, 
  Sparkles, 
  Lock,
  TrendingUp
} from 'lucide-react';

interface DocumentStats {
  totalDocuments: number;
  recentUploads: number;
  storageUsed: number;
  documentsByType: { [key: string]: number };
}

const Documents = () => {
  const { user, loading } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState<DocumentStats>({
    totalDocuments: 0,
    recentUploads: 0,
    storageUsed: 0,
    documentsByType: {}
  });

  const fetchDocumentStats = async () => {
    if (!user) return;

    try {
      const { data: documents, error } = await supabase
        .from('documents')
        .select('file_size, created_at, type')
        .eq('user_id', user.id);

      if (error) throw error;

      const totalDocuments = documents?.length || 0;
      
      // Calculate recent uploads (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentUploads = documents?.filter(doc => 
        new Date(doc.created_at) > sevenDaysAgo
      ).length || 0;

      // Calculate total storage used
      const storageUsed = documents?.reduce((total, doc) => 
        total + (doc.file_size || 0), 0
      ) || 0;

      // Calculate documents by type
      const documentsByType = documents?.reduce((acc, doc) => {
        acc[doc.type] = (acc[doc.type] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number }) || {};

      setStats({
        totalDocuments,
        recentUploads,
        storageUsed,
        documentsByType
      });
    } catch (error) {
      console.error('Error fetching document stats:', error);
    }
  };

  useEffect(() => {
    fetchDocumentStats();
  }, [user, refreshKey]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-gray-600">Please sign in to access document management.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-white/20 rounded-full mr-4">
                <Shield className="h-12 w-12" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Document Center</h1>
            </div>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Securely manage your immigration documents with our advanced platform. 
              Enterprise-grade security meets intuitive design.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-all">
                <div className="text-3xl font-bold mb-2">{stats.totalDocuments}</div>
                <div className="text-sm text-blue-100">Total Documents</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-all">
                <div className="text-3xl font-bold mb-2">{stats.recentUploads}</div>
                <div className="text-sm text-blue-100">Recent Uploads</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-all">
                <div className="text-3xl font-bold mb-2">{formatFileSize(stats.storageUsed)}</div>
                <div className="text-sm text-blue-100">Storage Used</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-all">
                <div className="text-3xl font-bold mb-2">High</div>
                <div className="text-sm text-blue-100">Security Level</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Document Type Overview */}
          <div className="mb-8">
            <Card className="shadow-lg border-0 bg-gradient-to-r from-white to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                  Document Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(stats.documentsByType).map(([type, count]) => (
                    <div key={type} className="text-center p-4 bg-white rounded-lg shadow-sm">
                      <div className="text-2xl font-bold text-purple-600 mb-1">{count}</div>
                      <div className="text-sm text-gray-600 uppercase tracking-wide">{type}</div>
                    </div>
                  ))}
                  {Object.keys(stats.documentsByType).length === 0 && (
                    <div className="col-span-full text-center text-gray-500 py-8">
                      No documents uploaded yet. Start by uploading your first document!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl overflow-hidden">
            <Tabs defaultValue="upload" className="space-y-8">
              <div className="flex justify-center pt-8">
                <TabsList className="grid w-full max-w-2xl grid-cols-2 h-16 bg-slate-100/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-3xl p-2">
                  <TabsTrigger 
                    value="upload" 
                    className="flex items-center gap-4 text-lg font-semibold h-full rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-primary transition-all duration-300"
                  >
                    <Upload className="h-6 w-6" />
                    Upload Documents
                  </TabsTrigger>
                  <TabsTrigger 
                    value="manage" 
                    className="flex items-center gap-4 text-lg font-semibold h-full rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-primary transition-all duration-300"
                  >
                    <FileText className="h-6 w-6" />
                    My Documents
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="upload" className="px-8 pb-8">
                <div className="max-w-5xl mx-auto">
                  <div className="mb-10 text-center">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                      Upload Your Documents
                    </h2>
                    <p className="text-lg text-gray-600 font-medium max-w-2xl mx-auto">
                      Experience seamless file uploading with our advanced interface. 
                      We support PDF, DOC, and DOCX formats up to 10MB.
                    </p>
                  </div>
                  <DocumentUpload onSuccess={handleUploadSuccess} />
                </div>
              </TabsContent>

              <TabsContent value="manage" className="px-8 pb-8">
                <div className="max-w-7xl mx-auto">
                  <div className="mb-10 text-center">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                      Your Document Library
                    </h2>
                    <p className="text-lg text-gray-600 font-medium max-w-2xl mx-auto">
                      Access, download, and manage all your uploaded documents in one secure, organized location.
                    </p>
                  </div>
                  <DocumentList refresh={refreshKey} />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Security Footer */}
          <footer className="mt-12 text-center">
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl border border-white/30 shadow-xl p-8 mx-auto max-w-2xl">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
                <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Enterprise-Grade Security
                </span>
              </div>
              <div className="flex items-center justify-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">256-bit encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-gray-600">GDPR compliant</span>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Your documents are protected with bank-level encryption and stored securely. 
                We maintain strict privacy standards and never share your personal information.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Documents;
