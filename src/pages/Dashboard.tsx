import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  GraduationCap, 
  MessageSquare, 
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  User,
  BookOpen,
  Target,
  FileImage
} from 'lucide-react';
import { format } from 'date-fns';
import Header from '@/components/Header';
import DocumentUpload from '@/components/DocumentUpload';
import EnquiryForm from '@/components/EnquiryForm';
import EnquiryList from '@/components/EnquiryList';
import { TaskList } from '@/components/TaskList';

interface ShortlistedUniversity {
  id: string;
  university_name: string;
  program_name: string;
  application_status: string;
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

interface Enquiry {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
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

interface CV {
  id: string;
  title: string;
  google_docs_link: string;
  created_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [universities, setUniversities] = useState<ShortlistedUniversity[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [sops, setSops] = useState<SOP[]>([]);
  const [lors, setLors] = useState<LOR[]>([]);
  const [cvs, setCvs] = useState<CV[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      const [universitiesData, documentsData, enquiriesData, sopsData, lorsData, cvsData] = await Promise.all([
        supabase.from('shortlisted_universities').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('documents').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('enquiries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('sops').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('lors').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('cvs').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ]);

      if (universitiesData.error) throw universitiesData.error;
      if (documentsData.error) throw documentsData.error;
      if (enquiriesData.error) throw enquiriesData.error;
      if (sopsData.error) throw sopsData.error;
      if (lorsData.error) throw lorsData.error;
      if (cvsData.error) throw cvsData.error;

      setUniversities(universitiesData.data || []);
      setDocuments(documentsData.data || []);
      setEnquiries(enquiriesData.data || []);
      setSops(sopsData.data || []);
      setLors(lorsData.data || []);
      setCvs(cvsData.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    const totalSteps = 4; // Universities, Documents, SOPs, LORs
    let completedSteps = 0;
    
    if (universities.length > 0) completedSteps++;
    if (documents.length > 0) completedSteps++;
    if (sops.length > 0) completedSteps++;
    if (lors.length > 0) completedSteps++;
    
    return Math.round((completedSteps / totalSteps) * 100);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'not_applied': { label: 'Not Applied', variant: 'secondary' as const },
      'in_progress': { label: 'In Progress', variant: 'outline' as const },
      'applied': { label: 'Applied', variant: 'default' as const }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap['not_applied'];
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getEnquiryStatusColor = (status: string) => {
    return status === 'resolved' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  };

  const getEnquiryStatusIcon = (status: string) => {
    return status === 'resolved' ? CheckCircle : Clock;
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Student Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Track your German university application journey</p>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{calculateProgress()}%</div>
                <Progress value={calculateProgress()} className="mb-2" />
                <p className="text-xs text-muted-foreground">
                  Keep going! Complete your application requirements.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{universities.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{documents.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Enquiries</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {enquiries.filter(e => e.status === 'open').length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="communications">Communications</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* CVs Section */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      CVs ({cvs.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cvs.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No CVs created</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {cvs.slice(0, 3).map((cv) => (
                          <div key={cv.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{cv.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(cv.created_at), 'MMM dd, yyyy')}
                              </p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a href={cv.google_docs_link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                View
                              </a>
                            </Button>
                          </div>
                        ))}
                        {cvs.length > 3 && (
                          <p className="text-sm text-center text-muted-foreground">
                            +{cvs.length - 3} more CVs
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* SOPs Section */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      SOPs ({sops.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {sops.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No SOPs created</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sops.slice(0, 3).map((sop) => (
                          <div key={sop.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{sop.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(sop.created_at), 'MMM dd, yyyy')}
                              </p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a href={sop.google_docs_link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                View
                              </a>
                            </Button>
                          </div>
                        ))}
                        {sops.length > 3 && (
                          <p className="text-sm text-center text-muted-foreground">
                            +{sops.length - 3} more SOPs
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* LORs Section */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileImage className="h-5 w-5" />
                      LORs ({lors.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {lors.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileImage className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No LORs created</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {lors.slice(0, 3).map((lor) => (
                          <div key={lor.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{lor.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(lor.created_at), 'MMM dd, yyyy')}
                              </p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a href={lor.google_docs_link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                View
                              </a>
                            </Button>
                          </div>
                        ))}
                        {lors.length > 3 && (
                          <p className="text-sm text-center text-muted-foreground">
                            +{lors.length - 3} more LORs
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Communications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Recent Communications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {enquiries.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No enquiries submitted</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {enquiries.slice(0, 3).map((enquiry) => {
                          const StatusIcon = getEnquiryStatusIcon(enquiry.status);
                          return (
                            <div key={enquiry.id} className="p-3 border rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium">{enquiry.subject}</h4>
                                <Badge className={getEnquiryStatusColor(enquiry.status)}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {enquiry.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {enquiry.message}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(enquiry.created_at), 'MMM dd, yyyy')}
                              </div>
                            </div>
                          );
                        })}
                        {enquiries.length > 3 && (
                          <p className="text-sm text-center text-muted-foreground">
                            +{enquiries.length - 3} more enquiries
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="applications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  {universities.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No shortlisted universities yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {universities.map((university) => (
                        <div key={university.id} className="border rounded-lg p-4">
                          <h3 className="font-medium">{university.university_name}</h3>
                          <p className="text-sm text-muted-foreground">{university.program_name}</p>
                          <div className="mt-2">
                            {getStatusBadge(university.application_status)}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(university.created_at), 'MMM dd, yyyy')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Your Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DocumentUpload />
                  <div className="mt-4">
                    {documents.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No documents uploaded yet</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {documents.map((doc) => (
                          <div key={doc.id} className="border rounded-lg p-4">
                            <h3 className="font-medium">{doc.title}</h3>
                            <p className="text-sm text-muted-foreground">{doc.type}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(doc.created_at), 'MMM dd, yyyy')}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="communications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Communications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EnquiryForm />
                  <EnquiryList />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <TaskList userId={user?.id || ''} isEmployee={false} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Coming soon!</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
