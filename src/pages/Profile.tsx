import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, MapPin, GraduationCap, Building, Calendar, Edit2, Save, X, Camera } from 'lucide-react';
import ProfilePhotoUploader from '@/components/ProfilePhotoUploader';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  target_program: string;
  target_university: string;
  consultation_status: string;
  role: string;
  created_at: string;
  updated_at: string;
  avatar_url?: string | null;
}

const Profile = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    target_program: '',
    target_university: '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (user && !authLoading) {
      fetchProfile();
    }
  }, [user, authLoading]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        target_program: data.target_program || '',
        target_university: data.target_university || '',
      });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }

    if (formData.phone && formData.phone.trim() && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.target_program && formData.target_program.trim().length > 0 && formData.target_program.trim().length < 3) {
      newErrors.target_program = 'Target program must be at least 3 characters';
    }

    if (formData.target_university && formData.target_university.trim().length > 0 && formData.target_university.trim().length < 3) {
      newErrors.target_university = 'Target university must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim() || null,
          target_program: formData.target_program.trim() || null,
          target_university: formData.target_university.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully!",
        variant: "default",
      });

      setEditing(false);
      setErrors({}); // Clear any validation errors
      fetchProfile(); // Refresh the profile data
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        target_program: profile.target_program || '',
        target_university: profile.target_university || '',
      });
    }
    setErrors({});
    setEditing(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'inquiry': return 'bg-blue-100 text-blue-800';
      case 'consultation': return 'bg-yellow-100 text-yellow-800';
      case 'application': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'employee': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading profile...</p>
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
            <p className="text-muted-foreground">Please sign in to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
            <p className="text-muted-foreground">
              Manage your personal information and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Overview Card */}
            <Card className="lg:col-span-1">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
                    <AvatarFallback className="text-lg">
                      {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">{profile?.full_name || 'User'}</CardTitle>
                <CardDescription className="flex items-center justify-center gap-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </CardDescription>
                <div className="mt-4">
                  <ProfilePhotoUploader userId={user.id} currentUrl={profile?.avatar_url} onUploaded={() => fetchProfile()} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Role</span>
                  <Badge className={getRoleBadgeColor(userRole || 'user')}>
                    {userRole || 'user'}
                  </Badge>
                </div>
                
                {profile?.consultation_status && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge className={getStatusColor(profile.consultation_status)}>
                      {profile.consultation_status}
                    </Badge>
                  </div>
                )}

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(profile?.created_at || '').toLocaleDateString()}</span>
                  </div>
                  
                  {profile?.updated_at !== profile?.created_at && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Edit2 className="h-4 w-4" />
                      <span>Last updated {new Date(profile?.updated_at || '').toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Profile Details Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details and preferences
                    </CardDescription>
                  </div>
                  {!editing ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEditing(true)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleSave}
                        disabled={saving}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name *
                    </Label>
                    {editing ? (
                      <div>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, full_name: e.target.value }));
                            if (errors.full_name) {
                              setErrors(prev => ({ ...prev, full_name: '' }));
                            }
                          }}
                          className={errors.full_name ? 'border-destructive' : ''}
                          placeholder="Enter your full name"
                        />
                        {errors.full_name && (
                          <p className="text-sm text-destructive mt-1">{errors.full_name}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground py-2">
                        {profile?.full_name || 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    {editing ? (
                      <div>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, phone: e.target.value }));
                            if (errors.phone) {
                              setErrors(prev => ({ ...prev, phone: '' }));
                            }
                          }}
                          className={errors.phone ? 'border-destructive' : ''}
                          placeholder="Enter your phone number"
                        />
                        {errors.phone && (
                          <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground py-2">
                        {profile?.phone || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {userRole !== 'employee' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Academic Interests
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="target_program" className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Target Program
                      </Label>
                      {editing ? (
                        <Input
                          id="target_program"
                          value={formData.target_program}
                          onChange={(e) => setFormData(prev => ({ ...prev, target_program: e.target.value }))}
                          placeholder="e.g., Master's in Computer Science"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground py-2">
                          {profile?.target_program || 'Not specified'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="target_university" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Target University
                      </Label>
                      {editing ? (
                        <Input
                          id="target_university"
                          value={formData.target_university}
                          onChange={(e) => setFormData(prev => ({ ...prev, target_university: e.target.value }))}
                          placeholder="e.g., Technical University of Munich"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground py-2">
                          {profile?.target_university || 'Not specified'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
