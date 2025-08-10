import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import DocumentUpload from '@/components/DocumentUpload';
import DocumentList from '@/components/DocumentList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Upload, FolderOpen, Shield, Sparkles, Lock } from 'lucide-react';

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
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchDocumentStats = async () => {
    if (!user) return;

    try {
      setStatsLoading(true);
      
      // Fetch all documents for the user
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
    } finally {
      setStatsLoading(false);
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
    // Optionally show a success message
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-orange-50/30 dark:from-slate-900 dark:via-purple-900/20 dark:to-orange-900/20">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header Section */}
          <div className="mb-12 text-center relative">
            {/* Enhanced background decoration */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <div className="w-96 h-96 bg-gradient-to-r from-primary via-purple-400 to-accent rounded-full blur-3xl animate-pulse"></div>
            </div>
            <div className="absolute top-20 left-1/4 w-32 h-32 bg-gradient-to-r from-accent/20 to-primary/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 right-1/4 w-24 h-24 bg-gradient-to-r from-primary/20 to-purple-400/20 rounded-full blur-xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-accent rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                  <div className="relative p-5 bg-gradient-to-r from-primary via-purple-500 to-accent rounded-full shadow-2xl">
                    <FolderOpen className="h-12 w-12 text-white" />
                  </div>
                </div>
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              </div>
              
              <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-purple-600 to-accent bg-clip-text text-transparent mb-6 tracking-tight">
                Document Management
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8 font-medium">
                Experience next-generation document management with enterprise-grade security. 
                Your academic journey deserves the best tools - organize, secure, and access your documents with elegance.
              </p>
              
              <div className="flex items-center justify-center gap-4 text-sm font-medium">
                <div className="flex items-center gap-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Lock className="h-5 w-5 text-emerald-600" />
                  <span className="text-slate-700 dark:text-slate-300">256-bit encryption</span>
                </div>
                <div className="flex items-center gap-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span className="text-slate-700 dark:text-slate-300">GDPR compliant</span>
                </div>
                <div className="flex items-center gap-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <span className="text-slate-700 dark:text-slate-300">Auto-organized</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            <Card className="group hover:scale-105 transition-all duration-500 bg-gradient-to-br from-primary via-purple-500 to-purple-600 text-white border-0 shadow-2xl hover:shadow-3xl rounded-3xl overflow-hidden">
              <CardContent className="p-8 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center gap-5">
                  <div className="p-4 bg-white/20 rounded-2xl group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                    <FileText className="h-10 w-10" />
                  </div>
                  <div>
                    <p className="text-sm opacity-90 font-semibold tracking-wide uppercase">Total Documents</p>
                    <p className="text-4xl font-bold tracking-tight mt-2">
                      {statsLoading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        <span className="tabular-nums">{stats.totalDocuments}</span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:scale-105 transition-all duration-500 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 text-white border-0 shadow-2xl hover:shadow-3xl rounded-3xl overflow-hidden">
              <CardContent className="p-8 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center gap-5">
                  <div className="p-4 bg-white/20 rounded-2xl group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                    <Upload className="h-10 w-10" />
                  </div>
                  <div>
                    <p className="text-sm opacity-90 font-semibold tracking-wide uppercase">Recent Uploads</p>
                    <p className="text-4xl font-bold tracking-tight mt-2">
                      {statsLoading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        <span className="tabular-nums">{stats.recentUploads}</span>
                      )}
                    </p>
                    <p className="text-xs opacity-80 mt-1 font-medium">Last 7 days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:scale-105 transition-all duration-500 bg-gradient-to-br from-accent via-orange-500 to-red-500 text-white border-0 shadow-2xl hover:shadow-3xl rounded-3xl overflow-hidden">
              <CardContent className="p-8 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center gap-5">
                  <div className="p-4 bg-white/20 rounded-2xl group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                    <FolderOpen className="h-10 w-10" />
                  </div>
                  <div>
                    <p className="text-sm opacity-90 font-semibold tracking-wide uppercase">Storage Used</p>
                    <p className="text-4xl font-bold tracking-tight mt-2">
                      {statsLoading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        <span className="tabular-nums">{formatFileSize(stats.storageUsed)}</span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:scale-105 transition-all duration-500 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 text-white border-0 shadow-2xl hover:shadow-3xl rounded-3xl overflow-hidden">
              <CardContent className="p-8 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center gap-5">
                  <div className="p-4 bg-white/20 rounded-2xl group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                    <Shield className="h-10 w-10" />
                  </div>
                  <div>
                    <p className="text-sm opacity-90 font-semibold tracking-wide uppercase">Security Level</p>
                    <p className="text-4xl font-bold tracking-tight mt-2">High</p>
                    <p className="text-xs opacity-80 mt-1 font-medium">Enterprise grade</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Premium Main Content */}
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl p-10 relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-primary to-purple-500 rounded-full blur-xl"></div>
              <div className="absolute bottom-10 right-10 w-16 h-16 bg-gradient-to-r from-accent to-orange-500 rounded-full blur-lg"></div>
            </div>
            
            <Tabs defaultValue="upload" className="space-y-10 relative z-10">
              <div className="flex justify-center">
                <TabsList className="grid w-full max-w-2xl grid-cols-2 h-16 bg-slate-100/90 dark:bg-slate-700/90 backdrop-blur-sm border border-white/30 shadow-xl rounded-3xl p-2">
                  <TabsTrigger 
                    value="upload" 
                    className="flex items-center gap-4 text-lg font-semibold h-full rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-primary transition-all duration-300 hover:scale-105"
                  >
                    <Upload className="h-6 w-6" />
                    Upload Documents
                  </TabsTrigger>
                  <TabsTrigger 
                    value="manage" 
                    className="flex items-center gap-4 text-lg font-semibold h-full rounded-2xl data-[state=active]:bg-white data-[state=active]:shadow-xl data-[state=active]:text-primary transition-all duration-300 hover:scale-105"
                  >
                    <FileText className="h-6 w-6" />
                    My Documents
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="upload" className="mt-12">
                <div className="max-w-5xl mx-auto">
                  <div className="mb-10 text-center">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">Upload Your Documents</h2>
                    <p className="text-lg text-muted-foreground font-medium">Experience seamless file uploading with our advanced drag-and-drop interface. We support PDF, DOC, and DOCX formats up to 10MB.</p>
                  </div>
                  <DocumentUpload onSuccess={handleUploadSuccess} />
                </div>
              </TabsContent>

              <TabsContent value="manage" className="mt-12">
                <div className="max-w-7xl mx-auto">
                  <div className="mb-10 text-center">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">Your Document Library</h2>
                    <p className="text-lg text-muted-foreground font-medium">Access, download, and manage all your uploaded documents in one secure, organized location.</p>
                  </div>
                  <DocumentList refresh={refreshKey} />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Enhanced Footer */}
          <footer className="mt-20 text-center">
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-3xl border border-white/30 shadow-xl p-8 mx-auto max-w-2xl">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Enterprise-Grade Security
                </span>
              </div>
              <p className="text-muted-foreground font-medium leading-relaxed">
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