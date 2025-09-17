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
import { Plus, Users, FileText, UserCheck, Search, Upload, MessageSquare, Calendar, CheckCircle, Clock, ExternalLink, Download, User, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import DocumentDownloadManager from '@/components/DocumentDownloadManager';
import { TaskList } from '@/components/TaskList';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import EnquiryManagement from '@/components/EnquiryManagement';

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

interface CV {
  id: string;
  user_id: string;
  title: string;
  google_docs_link: string;
  created_at: string;
}

interface CVResponse {
  id: string;
  user_id: string;
  summary?: string;
  education_history?: string;
  work_experience?: string;
  technical_skills?: string;
  soft_skills?: string;
  languages?: string;
  certifications?: string;
  extracurriculars?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

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

interface Enquiry {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  created_at: string;
}

interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  assigned_by: string;
  created_at: string;
  updated_at: string;
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

  const [cvForm, setCvForm] = useState({
    title: '',
    google_docs_link: ''
  });

  const [universities, setUniversities] = useState<ShortlistedUniversity[]>([]);
  const [sops, setSops] = useState<SOP[]>([]);
  const [lors, setLors] = useState<LOR[]>([]);
  const [cvs, setCvs] = useState<CV[]>([]);
  const [cvResponses, setCvResponses] = useState<CVResponse[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: ''
  });
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [taskListKey, setTaskListKey] = useState(0);
  const [questionnaireResponses, setQuestionnaireResponses] = useState<{
    sop: any;
    lor: any;
    cv: any;
    educationEntries: any[];
  }>({
    sop: null,
    lor: null,
    cv: null,
    educationEntries: [],
  });

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
    try {
      const { data, error } = await supabase
      .from('profiles')
        .select('id, user_id, full_name, created_at')
      .eq('role', 'user');
    
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    }
  };

  const fetchUserData = async (userId: string) => {
    setLoading(true);
    
    try {
      const [universitiesData, sopsData, lorsData, cvsData, cvResponsesData, documentsData, enquiriesData, questionnaireData] = await Promise.all([
        supabase.from('shortlisted_universities').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('sops').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('lors').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('cvs').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('cv_responses').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('documents').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('enquiries').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        fetchQuestionnaireResponses(userId)
      ]);

      // Check for errors
      if (universitiesData.error) throw universitiesData.error;
      if (sopsData.error) throw sopsData.error;
      if (lorsData.error) throw lorsData.error;
      if (cvsData.error) throw cvsData.error;
      if (cvResponsesData.error) throw cvResponsesData.error;
      if (documentsData.error) throw documentsData.error;
      if (enquiriesData.error) throw enquiriesData.error;

      setUniversities(universitiesData.data || []);
      setSops(sopsData.data || []);
      setLors(lorsData.data || []);
      setCvs(cvsData.data || []);
      setCvResponses((cvResponsesData.data || []) as CVResponse[]);
      setDocuments((documentsData.data || []) as Document[]);
      setEnquiries((enquiriesData.data || []) as Enquiry[]);
      setQuestionnaireResponses(questionnaireData);
      
      // Load tasks from localStorage
      const existingTasks = JSON.parse(localStorage.getItem('employeeTasks') || '[]');
      const userTasks = existingTasks.filter((task: Task) => task.user_id === userId);
      setTasks(userTasks);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionnaireResponses = async (userId: string) => {
    try {
      const [sopData, lorData, cvData, educationData] = await Promise.all([
        supabase.from('sop_responses').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('lor_responses').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('cv_responses').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('cv_education_entries').select('*').eq('user_id', userId).order('start_date', { ascending: true })
      ]);

      return {
        sop: sopData.data,
        lor: lorData.data,
        cv: cvData.data,
        educationEntries: educationData.data || [],
      };
    } catch (error) {
      console.error('Error fetching questionnaire responses:', error);
      return {
        sop: null,
        lor: null,
        cv: null,
        educationEntries: [],
      };
    }
  };

  const handleQuestionnaireResponseDeleted = (type: 'cv' | 'sop' | 'lor') => {
    setQuestionnaireResponses((prev) => {
      const next = { ...prev, [type]: null };
      return type === 'cv' ? { ...next, educationEntries: [] } : next;
    });

    if (type === 'cv') {
      setCvResponses([]);
    }
  };

  const handleAddUniversity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !universityForm.university_name.trim() || !universityForm.program_name.trim()) {
      toast({ 
        title: "Validation Error", 
        description: "Please fill in all required fields", 
        variant: "destructive" 
      });
      return;
    }

    const { error } = await supabase
      .from('shortlisted_universities')
      .insert({
        user_id: selectedUserId,
        university_name: universityForm.university_name.trim(),
        program_name: universityForm.program_name.trim(),
        application_status: universityForm.application_status as 'not_applied' | 'in_progress' | 'applied'
      });

    if (error) {
      console.error('Error adding university:', error);
      toast({ title: "Error", description: "Failed to add university", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "University added successfully" });
      setUniversityForm({ university_name: '', program_name: '', application_status: 'not_applied' });
      fetchUserData(selectedUserId);
    }
  };

  const handleDeleteUniversity = async (universityId: string) => {
    try {
      const { error } = await supabase
        .from('shortlisted_universities')
        .delete()
        .eq('id', universityId);

      if (error) throw error;
      
      toast({
        title: "University removed",
        description: "University has been removed from the shortlist.",
      });
      
      if (selectedUserId) {
        fetchUserData(selectedUserId);
      }
    } catch (error) {
      console.error('Error deleting university:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove university.",
      });
    }
  };

  const handleDeleteSOP = async (sopId: string) => {
    try {
      const { error } = await supabase
        .from('sops')
        .delete()
        .eq('id', sopId);

      if (error) throw error;
      
      toast({
        title: "SOP removed",
        description: "SOP has been removed.",
      });
      
      if (selectedUserId) {
        fetchUserData(selectedUserId);
      }
    } catch (error) {
      console.error('Error deleting SOP:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove SOP.",
      });
    }
  };

  const handleDeleteLOR = async (lorId: string) => {
    try {
      const { error } = await supabase
        .from('lors')
        .delete()
        .eq('id', lorId);

      if (error) throw error;
      
      toast({
        title: "LOR removed",
        description: "LOR has been removed.",
      });
      
      if (selectedUserId) {
        fetchUserData(selectedUserId);
      }
    } catch (error) {
      console.error('Error deleting LOR:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove LOR.",
      });
    }
  };

  const handleDeleteCV = async (cvId: string) => {
    try {
      const { error } = await supabase
        .from('cvs')
        .delete()
        .eq('id', cvId);

      if (error) throw error;
      
      toast({
        title: "CV removed",
        description: "CV has been removed.",
      });
      
      if (selectedUserId) {
        fetchUserData(selectedUserId);
      }
    } catch (error) {
      console.error('Error deleting CV:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove CV.",
      });
    }
  };

  const handleAddSOP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !sopForm.title.trim() || !sopForm.google_docs_link.trim()) {
      toast({ 
        title: "Validation Error", 
        description: "Please fill in all required fields", 
        variant: "destructive" 
      });
      return;
    }

    // Validate URL format
    try {
      new URL(sopForm.google_docs_link);
    } catch {
      toast({ 
        title: "Validation Error", 
        description: "Please enter a valid URL", 
        variant: "destructive" 
      });
      return;
    }

    const { error } = await supabase
      .from('sops')
      .insert({
        user_id: selectedUserId,
        title: sopForm.title.trim(),
        google_docs_link: sopForm.google_docs_link.trim()
      });

    if (error) {
      console.error('Error adding SOP:', error);
      toast({ title: "Error", description: "Failed to add SOP", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "SOP added successfully" });
      setSopForm({ title: '', google_docs_link: '' });
      fetchUserData(selectedUserId);
    }
  };

  const handleAddLOR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !lorForm.title.trim() || !lorForm.google_docs_link.trim()) {
      toast({ 
        title: "Validation Error", 
        description: "Please fill in all required fields", 
        variant: "destructive" 
      });
      return;
    }

    // Validate URL format
    try {
      new URL(lorForm.google_docs_link);
    } catch {
      toast({ 
        title: "Validation Error", 
        description: "Please enter a valid URL", 
        variant: "destructive" 
      });
      return;
    }

    const { error } = await supabase
      .from('lors')
      .insert({
        user_id: selectedUserId,
        title: lorForm.title.trim(),
        google_docs_link: lorForm.google_docs_link.trim()
      });

    if (error) {
      console.error('Error adding LOR:', error);
      toast({ title: "Error", description: "Failed to add LOR", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "LOR added successfully" });
      setLorForm({ title: '', google_docs_link: '' });
      fetchUserData(selectedUserId);
    }
  };

  const handleAddCV = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleAddCV called with selectedUserId:', selectedUserId);
    console.log('cvForm:', cvForm);
    
    if (!selectedUserId || !cvForm.title.trim() || !cvForm.google_docs_link.trim()) {
      console.log('Validation failed - missing fields');
      toast({ 
        title: "Validation Error", 
        description: "Please fill in all required fields", 
        variant: "destructive" 
      });
      return;
    }

    // Validate URL format
    try {
      new URL(cvForm.google_docs_link);
      console.log('URL validation passed');
    } catch {
      toast({ 
        title: "Validation Error", 
        description: "Please enter a valid URL", 
        variant: "destructive" 
      });
      console.log('URL validation failed');
      return;
    }

    console.log('Attempting to insert CV into database...');
    const { error } = await supabase
      .from('cvs')
      .insert({
        user_id: selectedUserId,
        title: cvForm.title.trim(),
        google_docs_link: cvForm.google_docs_link.trim()
      });

    if (error) {
      console.error('Error adding CV:', error);
      toast({ title: "Error", description: "Failed to add CV", variant: "destructive" });
    } else {
      console.log('CV added successfully');
      toast({ title: "Success", description: "CV added successfully" });
      setCvForm({ title: '', google_docs_link: '' });
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


  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDocumentDownload = async (doc: Document) => {
    // Debug log to see what data we have
    console.log('Attempting to download document:', doc);
    
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

    console.log('Extracted path:', path);

    if (!path) {
      toast({ 
        title: 'Download failed', 
        description: `No file path available. File URL: ${doc.file_url || 'none'}, File Path: ${doc.file_path || 'none'}`, 
        variant: 'destructive' 
      });
      return;
    }

    try {
      // Always download as Blob to ensure reliable cross-origin downloads
      const { data, error } = await supabase.storage.from('documents').download(path);
      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name || doc.title || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: 'Success', description: 'Document downloaded successfully' });
    } catch (error: any) {
      console.error('Download error:', error);
      toast({ 
        title: 'Download failed', 
        description: `Error: ${error.message || 'Unknown error occurred'}. Path: ${path}`, 
        variant: 'destructive' 
      });
    }
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'LOR': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'CV': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'transcript': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'photo': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'PASSPORT': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'IELTS': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !taskForm.title.trim() || !taskForm.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // For now, we'll store tasks in localStorage since the table doesn't exist
      // In a real implementation, this would be saved to the database
      const newTask: Task = {
        id: Date.now().toString(),
        user_id: selectedUserId,
        title: taskForm.title,
        description: taskForm.description,
        status: 'pending',
        priority: taskForm.priority as 'low' | 'medium' | 'high',
        due_date: taskForm.due_date || undefined,
        assigned_by: user?.id || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Add to state
      setTasks(prev => [newTask, ...prev]);

      // Save to localStorage
      const existingTasks = JSON.parse(localStorage.getItem('employeeTasks') || '[]');
      existingTasks.push(newTask);
      localStorage.setItem('employeeTasks', JSON.stringify(existingTasks));

      // Reset form
      setTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        due_date: ''
      });

      toast({
        title: "Success",
        description: "Task assigned successfully",
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to assign task",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    try {
      // Update in state
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus, updated_at: new Date().toISOString() }
          : task
      ));

      // Update localStorage
      const existingTasks = JSON.parse(localStorage.getItem('employeeTasks') || '[]');
      const updatedTasks = existingTasks.map((task: Task) => 
        task.id === taskId 
          ? { ...task, status: newStatus, updated_at: new Date().toISOString() }
          : task
      );
      localStorage.setItem('employeeTasks', JSON.stringify(updatedTasks));

      toast({
        title: "Success",
        description: "Task status updated",
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleTaskCreated = () => {
    // Refresh the task list by updating the key
    setTaskListKey(prev => prev + 1);
    toast({
      title: "Task Created",
      description: "Task has been successfully assigned to the student.",
    });
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || !isEmployee) {
    return (
      <div>
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
      </div>
    );
  }

  return (
    <div>
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
                  <TabsList className="grid w-full grid-cols-8">
                    <TabsTrigger value="universities">Universities</TabsTrigger>
                    <TabsTrigger value="sops">SOPs</TabsTrigger>
                    <TabsTrigger value="lors">LORs</TabsTrigger>
                    <TabsTrigger value="cvs">CVs</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="enquiries">Enquiries</TabsTrigger>
                    <TabsTrigger value="questionnaire">Responses</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
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
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {universities.map((university) => (
                              <TableRow key={university.id}>
                                <TableCell>{university.university_name}</TableCell>
                                <TableCell>{university.program_name}</TableCell>
                                <TableCell>{getStatusBadge(university.application_status)}</TableCell>
                                <TableCell>{new Date(university.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteUniversity(university.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
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
                              <TableHead>Actions</TableHead>
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
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteSOP(sop.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
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
                              <TableHead>Actions</TableHead>
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
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteLOR(lor.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="cvs" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Add CV
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleAddCV} className="space-y-4">
                          <div>
                            <Label htmlFor="cv-title">CV Title</Label>
                            <Input
                              id="cv-title"
                              value={cvForm.title}
                              onChange={(e) => setCvForm({...cvForm, title: e.target.value})}
                              placeholder="Enter CV title"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="cv-link">Google Docs Link</Label>
                            <Input
                              id="cv-link"
                              type="url"
                              value={cvForm.google_docs_link}
                              onChange={(e) => setCvForm({...cvForm, google_docs_link: e.target.value})}
                              placeholder="Enter Google Docs link"
                              required
                            />
                          </div>
                          <Button type="submit">Add CV</Button>
                        </form>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>CVs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Title</TableHead>
                              <TableHead>Link</TableHead>
                              <TableHead>Date Added</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {cvs.map((cv) => (
                              <TableRow key={cv.id}>
                                <TableCell>{cv.title}</TableCell>
                                <TableCell>
                                  <a
                                    href={cv.google_docs_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    View Document
                                  </a>
                                </TableCell>
                                <TableCell>{new Date(cv.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteCV(cv.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
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
                                <TableHead>Actions</TableHead>
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
                                    <div className="flex gap-2">
                                      {(doc.file_url || doc.file_path) && (
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          onClick={() => handleDocumentDownload(doc)}
                                          title="Download document"
                                        >
                                          <Download className="h-4 w-4 mr-1" />
                                          Download
                                        </Button>
                                      )}
                                      {doc.drive_link && (
                                        <Button variant="outline" size="sm" asChild title="Open in Google Drive">
                                          <a href={doc.drive_link} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-4 w-4 mr-1" />
                                            View
                                          </a>
                                        </Button>
                                      )}
                                      {!doc.file_url && !doc.file_path && !doc.drive_link && (
                                        <span className="text-muted-foreground text-sm">No download available</span>
                                      )}
                                    </div>
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
                    <EnquiryManagement 
                      userId={selectedUserId} 
                      currentUserId={user?.id}
                      isEmployee={true}
                    />
                  </TabsContent>

                  <TabsContent value="questionnaire" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Download User Responses
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Export user questionnaire responses as professional documents
                        </p>
                      </CardHeader>
                      <CardContent>
                        {!questionnaireResponses.sop && !questionnaireResponses.lor && !questionnaireResponses.cv ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No questionnaire responses submitted by this student</p>
                          </div>
                        ) : (
                          <DocumentDownloadManager 
                            selectedUserId={selectedUserId}
                            userName={users.find(u => u.user_id === selectedUserId)?.full_name || 'Unknown User'}
                            onResponseDeleted={handleQuestionnaireResponseDeleted}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Tasks Tab */}
                  <TabsContent value="tasks" className="space-y-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Task Management
                        </CardTitle>
                        <Button 
                          onClick={() => setShowCreateTaskModal(true)}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Create Task
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <TaskList 
                          key={taskListKey}
                          userId={selectedUserId || ''}
                          isEmployee={true}
                        />
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

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        onTaskCreated={handleTaskCreated}
        currentUserId={user.id}
        preselectedUserId={selectedUserId}
        preselectedUserName={users.find(u => u.user_id === selectedUserId)?.full_name || ''}
      />
    </div>
  );
};

export default EmployeeDashboard;
