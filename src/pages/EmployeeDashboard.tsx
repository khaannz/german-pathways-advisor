import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, FileText, UserCheck, Search, Upload, MessageSquare, Calendar, CheckCircle, Clock, ExternalLink, Download } from 'lucide-react';
import { format } from 'date-fns';

interface User {
  id: string;
  user_id: string;
  full_name: string;
  email?: string;
}

interface ShortlistedUniversity {
  id: string;
  user_id: string;
  university_name: string;
  program_name: string;
  application_status: string;
  created_at: string;
}

interface SOP {
  id: string;
  user_id: string;
  title: string;
  google_docs_link: string;
  created_at: string;
}

interface LOR {
  id: string;
  user_id: string;
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
  file_name: string | null;
  file_size: number | null;
  created_at: string;
}

interface Enquiry {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  created_at: string;
}

const EmployeeDashboard = () => {
  const { user, isEmployee } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form states
  const [universityForm, setUniversityForm] = useState({
    university_name: '',
    program_name: '',
    application_status: 'not_applied'
  });
  
  const [sopForm, setSopForm] = useState({
    title: '',
    google_docs_link: ''
  });
  
  const [lorForm, setLorForm] = useState({
    title: '',
    google_docs_link: ''
  });

  const [universities, setUniversities] = useState<ShortlistedUniversity[]>([]);
  const [sops, setSops] = useState<SOP[]>([]);
  const [lors, setLors] = useState<LOR[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);

  useEffect(() => {
    if (!user || !isEmployee) {
      return;
    }
    fetchUsers();
    setLoading(false);
  }, [user, isEmployee]);

  useEffect(() => {
    if (selectedUserId) {
      fetchUserData(selectedUserId);
    }
  }, [selectedUserId]);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, user_id, full_name')
      .eq('role', 'user');
    
    setUsers(data || []);
  };

  const fetchUserData = async (userId: string) => {
    setLoading(true);
    
    const [universitiesData, sopsData, lorsData, documentsData, enquiriesData] = await Promise.all([
      supabase.from('shortlisted_universities').select('*').eq('user_id', userId),
      supabase.from('sops').select('*').eq('user_id', userId),
      supabase.from('lors').select('*').eq('user_id', userId),
      supabase.from('documents').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('enquiries').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    ]);

    setUniversities(universitiesData.data || []);
    setSops(sopsData.data || []);
    setLors(lorsData.data || []);
    setDocuments((documentsData.data || []) as Document[]);
    setEnquiries((enquiriesData.data || []) as Enquiry[]);
    setLoading(false);
  };

  const handleAddUniversity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    const { error } = await supabase
      .from('shortlisted_universities')
      .insert({
        user_id: selectedUserId,
        university_name: universityForm.university_name,
        program_name: universityForm.program_name,
        application_status: universityForm.application_status as 'not_applied' | 'in_progress' | 'applied'
      });

    if (error) {
      toast({ title: "Error", description: "Failed to add university", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "University added successfully" });
      setUniversityForm({ university_name: '', program_name: '', application_status: 'not_applied' });
      fetchUserData(selectedUserId);
    }
  };

  const handleAddSOP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    const { error } = await supabase
      .from('sops')
      .insert({
        user_id: selectedUserId,
        title: sopForm.title,
        google_docs_link: sopForm.google_docs_link
      });

    if (error) {
      toast({ title: "Error", description: "Failed to add SOP", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "SOP added successfully" });
      setSopForm({ title: '', google_docs_link: '' });
      fetchUserData(selectedUserId);
    }
  };

  const handleAddLOR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    const { error } = await supabase
      .from('lors')
      .insert({
        user_id: selectedUserId,
        title: lorForm.title,
        google_docs_link: lorForm.google_docs_link
      });

    if (error) {
      toast({ title: "Error", description: "Failed to add LOR", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "LOR added successfully" });
      setLorForm({ title: '', google_docs_link: '' });
      fetchUserData(selectedUserId);
    }
  };

  const handleUpdateEnquiryStatus = async (enquiryId: string, newStatus: 'open' | 'resolved') => {
    const { error } = await supabase
      .from('enquiries')
      .update({ status: newStatus })
      .eq('id', enquiryId);

    if (error) {
      toast({ title: "Error", description: "Failed to update enquiry status", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Enquiry status updated successfully" });
      fetchUserData(selectedUserId);
    }
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'SOP': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'LOR': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'CV': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'transcript': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || !isEmployee) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-muted-foreground">This page is only accessible to employees.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Employee Dashboard</h1>
            <p className="text-muted-foreground">Manage user applications, documents, and enquiries</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Universities</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{universities.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents</CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{documents.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Enquiries</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{enquiries.length}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Select User
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="search">Search Users</Label>
                    <Input
                      id="search"
                      placeholder="Search by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="user-select">Select User</Label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredUsers.map((user) => (
                          <SelectItem key={user.user_id} value={user.user_id}>
                            {user.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-3">
              {selectedUserId ? (
                <Tabs defaultValue="universities" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="universities">Universities</TabsTrigger>
              <TabsTrigger value="sops">SOPs</TabsTrigger>
              <TabsTrigger value="lors">LORs</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="enquiries">Enquiries</TabsTrigger>
              <TabsTrigger value="questionnaire">Questionnaire</TabsTrigger>
            </TabsList>
                  
                  <TabsContent value="universities" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Add University
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleAddUniversity} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="university">University Name</Label>
                              <Input
                                id="university"
                                value={universityForm.university_name}
                                onChange={(e) => setUniversityForm({...universityForm, university_name: e.target.value})}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="program">Program Name</Label>
                              <Input
                                id="program"
                                value={universityForm.program_name}
                                onChange={(e) => setUniversityForm({...universityForm, program_name: e.target.value})}
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="status">Application Status</Label>
                            <Select value={universityForm.application_status} onValueChange={(value) => setUniversityForm({...universityForm, application_status: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="not_applied">Not Applied</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="applied">Applied</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button type="submit">Add University</Button>
                        </form>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Shortlisted Universities</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>University</TableHead>
                              <TableHead>Program</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Date Added</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {universities.map((university) => (
                              <TableRow key={university.id}>
                                <TableCell>{university.university_name}</TableCell>
                                <TableCell>{university.program_name}</TableCell>
                                <TableCell>{getStatusBadge(university.application_status)}</TableCell>
                                <TableCell>{new Date(university.created_at).toLocaleDateString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="sops" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Add SOP
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleAddSOP} className="space-y-4">
                          <div>
                            <Label htmlFor="sop-title">SOP Title</Label>
                            <Input
                              id="sop-title"
                              value={sopForm.title}
                              onChange={(e) => setSopForm({...sopForm, title: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="sop-link">Google Docs Link</Label>
                            <Input
                              id="sop-link"
                              type="url"
                              value={sopForm.google_docs_link}
                              onChange={(e) => setSopForm({...sopForm, google_docs_link: e.target.value})}
                              required
                            />
                          </div>
                          <Button type="submit">Add SOP</Button>
                        </form>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>SOPs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Title</TableHead>
                              <TableHead>Link</TableHead>
                              <TableHead>Date Added</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sops.map((sop) => (
                              <TableRow key={sop.id}>
                                <TableCell>{sop.title}</TableCell>
                                <TableCell>
                                  <a
                                    href={sop.google_docs_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    View Document
                                  </a>
                                </TableCell>
                                <TableCell>{new Date(sop.created_at).toLocaleDateString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="lors" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Add LOR
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleAddLOR} className="space-y-4">
                          <div>
                            <Label htmlFor="lor-title">LOR Title</Label>
                            <Input
                              id="lor-title"
                              value={lorForm.title}
                              onChange={(e) => setLorForm({...lorForm, title: e.target.value})}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="lor-link">Google Docs Link</Label>
                            <Input
                              id="lor-link"
                              type="url"
                              value={lorForm.google_docs_link}
                              onChange={(e) => setLorForm({...lorForm, google_docs_link: e.target.value})}
                              required
                            />
                          </div>
                          <Button type="submit">Add LOR</Button>
                        </form>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>LORs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Title</TableHead>
                              <TableHead>Link</TableHead>
                              <TableHead>Date Added</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {lors.map((lor) => (
                              <TableRow key={lor.id}>
                                <TableCell>{lor.title}</TableCell>
                                <TableCell>
                                  <a
                                    href={lor.google_docs_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    View Document
                                  </a>
                                </TableCell>
                                <TableCell>{new Date(lor.created_at).toLocaleDateString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="documents" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          Student Documents ({documents.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {documents.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No documents uploaded by this student</p>
                          </div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Date Added</TableHead>
                                <TableHead>Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {documents.map((doc) => (
                                <TableRow key={doc.id}>
                                  <TableCell className="font-medium">{doc.title}</TableCell>
                                  <TableCell>
                                    <Badge className={getDocumentTypeColor(doc.type)}>
                                      {doc.type}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {doc.file_size ? formatFileSize(doc.file_size) : 'External Link'}
                                  </TableCell>
                                  <TableCell>{format(new Date(doc.created_at), 'MMM dd, yyyy')}</TableCell>
                                  <TableCell>
                                    {doc.file_url && (
                                      <Button variant="outline" size="sm" className="mr-2">
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    )}
                                    {doc.drive_link && (
                                      <Button variant="outline" size="sm" asChild>
                                        <a href={doc.drive_link} target="_blank" rel="noopener noreferrer">
                                          <ExternalLink className="h-4 w-4" />
                                        </a>
                                      </Button>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="enquiries" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Student Enquiries ({enquiries.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {enquiries.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No enquiries submitted by this student</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {enquiries.map((enquiry) => {
                              const StatusIcon = getEnquiryStatusIcon(enquiry.status);
                              return (
                                <div key={enquiry.id} className="border rounded-lg p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-medium">{enquiry.subject}</h3>
                                    <div className="flex items-center gap-2">
                                      <Badge className={getEnquiryStatusColor(enquiry.status)}>
                                        <StatusIcon className="w-3 h-3 mr-1" />
                                        {enquiry.status}
                                      </Badge>
                                      {enquiry.status === 'open' && (
                                        <Button
                                          size="sm"
                                          onClick={() => handleUpdateEnquiryStatus(enquiry.id, 'resolved')}
                                        >
                                          Mark Resolved
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {enquiry.message}
                                  </p>
                                  
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(enquiry.created_at), 'MMM dd, yyyy • HH:mm')}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">Select a User</h3>
                      <p className="text-muted-foreground">Choose a user from the sidebar to manage their data</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeDashboard;
