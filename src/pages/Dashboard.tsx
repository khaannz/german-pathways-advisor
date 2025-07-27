import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText, GraduationCap, UserCheck, Upload, File } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

interface ShortlistedUniversity {
  id: string;
  university_name: string;
  program_name: string;
  application_status: 'not_applied' | 'in_progress' | 'applied';
  created_at: string;
}

interface SOP {
  id: string;
  title: string;
  google_docs_link: string;
  created_at: string;
}

interface LOR {
  id: string;
  title: string;
  google_docs_link: string;
  created_at: string;
}

interface Document {
  id: string;
  type: string;
  title: string;
  file_url: string | null;
  drive_link: string | null;
  created_at: string;
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [universities, setUniversities] = useState<ShortlistedUniversity[]>([]);
  const [sops, setSops] = useState<SOP[]>([]);
  const [lors, setLors] = useState<LOR[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setDataLoading(true);
      
      // Fetch shortlisted universities
      const { data: universitiesData, error: universitiesError } = await supabase
        .from('shortlisted_universities')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (universitiesError) throw universitiesError;

      // Fetch SOPs
      const { data: sopsData, error: sopsError } = await supabase
        .from('sops')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (sopsError) throw sopsError;

      // Fetch LORs
      const { data: lorsData, error: lorsError } = await supabase
        .from('lors')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (lorsError) throw lorsError;

      // Fetch Documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (documentsError) throw documentsError;

      setUniversities(universitiesData || []);
      setSops(sopsData || []);
      setLors(lorsData || []);
      setDocuments(documentsData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDataLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
        return <Badge variant="default" className="bg-green-100 text-green-800">Applied</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'not_applied':
        return <Badge variant="outline">Not Applied</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
            <p className="text-muted-foreground mt-2">Please sign in to view your dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Your Dashboard</h1>
          <p className="text-muted-foreground mt-2">Track your university applications, SOPs, and LORs</p>
        </div>

        <div className="grid gap-8">
          {/* Shortlisted Universities Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Shortlisted Universities
              </CardTitle>
              <CardDescription>
                Universities you've shortlisted and their application status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {universities.length === 0 ? (
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No universities shortlisted yet</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {universities.map((university) => (
                    <div key={university.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold text-foreground">{university.university_name}</h3>
                        <p className="text-sm text-muted-foreground">{university.program_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(university.application_status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SOPs Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Statement of Purpose (SOPs)
              </CardTitle>
              <CardDescription>
                SOPs created for your applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sops.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No SOPs created yet</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {sops.map((sop) => (
                    <div key={sop.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold text-foreground">{sop.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date(sop.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={sop.google_docs_link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Document
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Recent Documents
              </CardTitle>
              <CardDescription>
                Your uploaded documents and files
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">No documents uploaded yet</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/documents">Upload Documents</a>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold text-foreground">{doc.title}</h3>
                        <p className="text-sm text-muted-foreground">{doc.type}</p>
                        <p className="text-xs text-muted-foreground">
                          Added: {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {(doc.file_url || doc.drive_link) && (
                        <Button variant="outline" size="sm" asChild>
                          <a 
                            href={doc.drive_link || doc.file_url!} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                  {documents.length >= 5 && (
                    <div className="mt-4 text-center">
                      <Button variant="outline" size="sm" asChild>
                        <a href="/documents">View All Documents</a>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* LORs Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Letters of Recommendation (LORs)
              </CardTitle>
              <CardDescription>
                LORs created for your applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lors.length === 0 ? (
                <div className="text-center py-8">
                  <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No LORs created yet</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {lors.map((lor) => (
                    <div key={lor.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold text-foreground">{lor.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date(lor.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={lor.google_docs_link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Document
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;