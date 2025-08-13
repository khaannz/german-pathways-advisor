import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, FileText, GraduationCap, UserCheck, Upload, File, CheckCircle, Clock, AlertCircle, Plus, Calendar, Download, MessageSquare, TrendingUp, Target, User, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { format } from 'date-fns';
import { TaskList } from '@/components/TaskList';

interface CVResponse {
  id: string;
  user_id: string;
  summary?: string;
  created_at: string;
}

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

interface CV {
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

interface Enquiry {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  created_at: string;
  employee_response?: string;
  responded_at?: string;
}

interface DashboardStats {
  completionPercentage: number;
  totalApplications: number;
  pendingTasks: number;
  documentsUploaded: number;
  enquiriesOpen: number;
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [universities, setUniversities] = useState<ShortlistedUniversity[]>([]);
  const [sops, setSops] = useState<SOP[]>([]);
  const [cvs, setCvs] = useState<CV[]>([]);
  const [lors, setLors] = useState<LOR[]>([]);
  const [cvResponses, setCvResponses] = useState<CVResponse[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    completionPercentage: 0,
    totalApplications: 0,
    pendingTasks: 0,
    documentsUploaded: 0,
    enquiriesOpen: 0
  });
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setDataLoading(true);
      
      // Fetch all data in parallel
      const [universitiesData, sopsData, lorsData, cvResponsesData, documentsData, enquiriesData] = await Promise.all([
        supabase.from('shortlisted_universities').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }),
        supabase.from('sops').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }),
        supabase.from('lors').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }),
        supabase.from('cv_responses').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }),
        supabase.from('documents').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }),
        supabase.from('enquiries').select('*').eq('user_id', user?.id).order('created_at', { ascending: false })
      ]);

      // Check for errors
      if (universitiesData.error) throw universitiesData.error;
      if (sopsData.error) throw sopsData.error;
      if (lorsData.error) throw lorsData.error;
      if (cvResponsesData.error) throw cvResponsesData.error;
      if (documentsData.error) throw documentsData.error;
      if (enquiriesData.error) throw enquiriesData.error;

      // Set state
      setUniversities(universitiesData.data || []);
      setSops(sopsData.data || []);
      setCvs([]); // Empty for now since cvs table isn't in types
      setLors(lorsData.data || []);
      setCvResponses(cvResponsesData.data || []);
      setDocuments(documentsData.data || []);
      setEnquiries(enquiriesData.data as Enquiry[] || []);

      // Calculate stats
      calculateStats(
        universitiesData.data || [],
        sopsData.data || [],
        [], // Empty cvs
        lorsData.data || [],
        documentsData.data || [],
        enquiriesData.data || []
      );
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

  const calculateStats = (universities: any[], sops: any[], cvs: any[], lors: any[], documents: any[], enquiries: any[]) => {
    const totalApplications = universities.length;
    const documentsUploaded = documents.length;
    const enquiriesOpen = enquiries.filter(e => e.status === 'open').length;
    
    // Calculate completion percentage based on key milestones
    let completed = 0;
    const milestones = 6; // Total milestones
    
    if (universities.length > 0) completed++;
    if (sops.length > 0) completed++;
    if (cvs.length > 0) completed++;
    if (lors.length > 0) completed++;
    if (documents.length > 0) completed++;
    if (universities.some(u => u.application_status === 'applied')) completed++;
    
    const completionPercentage = Math.round((completed / milestones) * 100);
    
    // Calculate pending tasks
    let pendingTasks = 0;
    if (universities.length === 0) pendingTasks++;
    if (sops.length === 0) pendingTasks++;
    if (cvs.length === 0) pendingTasks++;
    if (lors.length === 0) pendingTasks++;
    if (universities.some(u => u.application_status === 'not_applied')) pendingTasks++;
    
    setStats({
      completionPercentage,
      totalApplications,
      pendingTasks,
      documentsUploaded,
      enquiriesOpen
    });
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
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Student Dashboard</h1>
          <p className="text-muted-foreground text-lg">Welcome back! Track your German university application journey</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
                  <p className="text-3xl font-bold text-primary">{stats.completionPercentage}%</p>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
              <Progress value={stats.completionPercentage} className="mt-3" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Applications</p>
                  <p className="text-3xl font-bold">{stats.totalApplications}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Tasks</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.pendingTasks}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Documents</p>
                  <p className="text-3xl font-bold text-green-600">{stats.documentsUploaded}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Open Enquiries</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.enquiriesOpen}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Get started with your application process</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link to="/questionnaire">
                      <Plus className="h-4 w-4 mr-2" />
                      Start Application Forms
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link to="/documents">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Documents
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link to="/enquiries">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact Consultant
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Your latest actions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...universities, ...sops, ...lors, ...documents]
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .slice(0, 5)
                      .map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                            {'university_name' in item ? <GraduationCap className="h-4 w-4 text-primary" /> :
                             'google_docs_link' in item ? <FileText className="h-4 w-4 text-primary" /> :
                             <Upload className="h-4 w-4 text-primary" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {'university_name' in item ? `Added ${item.university_name}` :
                               'title' in item ? `Created ${item.title}` :
                               'Uploaded document'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(item.created_at), 'MMM dd, yyyy • HH:mm')}
                            </p>
                          </div>
                        </div>
                      ))}
                    {universities.length === 0 && sops.length === 0 && lors.length === 0 && documents.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No recent activity</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    University Applications
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/questionnaire">
                      <Plus className="h-4 w-4 mr-2" />
                      Add University
                    </Link>
                  </Button>
                </CardTitle>
                <CardDescription>
                  Track your university applications and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {universities.length === 0 ? (
                  <div className="text-center py-12">
                    <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Universities Added Yet</h3>
                    <p className="text-muted-foreground mb-4">Start by adding universities you're interested in</p>
                    <Button asChild>
                      <Link to="/questionnaire">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First University
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {universities.map((university) => (
                      <Card key={university.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg">{university.university_name}</h3>
                            <p className="text-muted-foreground">{university.program_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Added: {format(new Date(university.created_at), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(university.application_status)}
                            <Button variant="outline" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* CVs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    CVs ({cvs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cvs.length === 0 ? (
                    <div className="text-center py-8">
                      <User className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-sm text-muted-foreground">No CVs created</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cvs.slice(0, 3).map((cv) => (
                        <div key={cv.id} className="p-3 border rounded-lg">
                          <h4 className="font-medium text-sm">{cv.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(cv.created_at), 'MMM dd')}
                          </p>
                          <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
                            <a href={cv.google_docs_link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* SOPs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    SOPs ({sops.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sops.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-sm text-muted-foreground">No SOPs created</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sops.slice(0, 3).map((sop) => (
                        <div key={sop.id} className="p-3 border rounded-lg">
                          <h4 className="font-medium text-sm">{sop.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(sop.created_at), 'MMM dd')}
                          </p>
                          <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
                            <a href={sop.google_docs_link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* LORs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    LORs ({lors.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lors.length === 0 ? (
                    <div className="text-center py-8">
                      <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-sm text-muted-foreground">No LORs created</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {lors.slice(0, 3).map((lor) => (
                        <div key={lor.id} className="p-3 border rounded-lg">
                          <h4 className="font-medium text-sm">{lor.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(lor.created_at), 'MMM dd')}
                          </p>
                          <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
                            <a href={lor.google_docs_link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="communications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Enquiries & Support
                  </div>
                  <Button size="sm" asChild>
                    <Link to="/enquiries">
                      <Plus className="h-4 w-4 mr-2" />
                      New Enquiry
                    </Link>
                  </Button>
                </CardTitle>
                <CardDescription>
                  Your communications with our consultants
                </CardDescription>
              </CardHeader>
              <CardContent>
                {enquiries.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Enquiries Yet</h3>
                    <p className="text-muted-foreground mb-4">Have questions? Our consultants are here to help</p>
                    <Button asChild>
                      <Link to="/enquiries">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Ask a Question
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enquiries.map((enquiry) => (
                      <Card key={enquiry.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{enquiry.subject}</h3>
                              <Badge variant={enquiry.status === 'resolved' ? 'default' : 'secondary'}>
                                {enquiry.status === 'resolved' ? (
                                  <><CheckCircle className="h-3 w-3 mr-1" /> Resolved</>
                                ) : (
                                  <><Clock className="h-3 w-3 mr-1" /> Open</>
                                )}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{enquiry.message}</p>
                            {enquiry.employee_response && (
                              <div className="mt-3 p-3 bg-primary/5 rounded-lg">
                                <p className="text-sm font-medium text-primary mb-1">Response:</p>
                                <p className="text-sm">{enquiry.employee_response}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Responded: {format(new Date(enquiry.responded_at!), 'MMM dd, yyyy • HH:mm')}
                                </p>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(enquiry.created_at), 'MMM dd, yyyy • HH:mm')}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  My Tasks
                </CardTitle>
                <CardDescription>
                  Tasks assigned to you by your advisor with comment functionality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaskList 
                  userId={user.id}
                  isEmployee={false}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Application Timeline
                </CardTitle>
                <CardDescription>
                  Your journey progress and upcoming deadlines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[...universities, ...sops, ...cvs, ...lors, ...documents, ...cvResponses]
                    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    .map((item, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                          {'university_name' in item ? <GraduationCap className="h-5 w-5 text-primary" /> :
                           'google_docs_link' in item ? <FileText className="h-5 w-5 text-primary" /> :
                           'summary' in item ? <User className="h-5 w-5 text-primary" /> :
                           <Upload className="h-5 w-5 text-primary" />}
                        </div>
                        <div className="flex-1 space-y-1">
                          <h4 className="font-medium">
                            {'university_name' in item ? `Added ${item.university_name}` :
                             'google_docs_link' in item && 'title' in item ? `Created ${item.title}` :
                             'summary' in item ? 'Created CV Response' :
                             'title' in item ? `Uploaded ${item.title}` :
                             'Uploaded document'}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(item.created_at), 'EEEE, MMMM dd, yyyy • HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))}
                  
                  {universities.length === 0 && sops.length === 0 && cvs.length === 0 && lors.length === 0 && documents.length === 0 && cvResponses.length === 0 && (
                    <div className="text-center py-12">
                      <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No Activity Yet</h3>
                      <p className="text-muted-foreground">Start your application journey to see your timeline</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;