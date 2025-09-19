import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { UserPlus, Mail, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";

interface UserManagementProps {
  className?: string;
}

export const UserManagement = ({ className }: UserManagementProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  
  // Create user form state
  const [createForm, setCreateForm] = useState({
    email: '',
    fullName: '',
    role: 'user'
  });

  // Reset password form state
  const [resetEmail, setResetEmail] = useState('');

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.email.trim() || !createForm.fullName.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(createForm.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: createForm.email.trim(),
          fullName: createForm.fullName.trim(),
          role: createForm.role
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success("User created successfully! Welcome email sent.");
        setCreateForm({ email: '', fullName: '', role: 'user' });
      } else {
        throw new Error(data.error || 'Failed to create user');
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setResetLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-password-reset', {
        body: {
          email: resetEmail.trim()
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success("Password reset email sent successfully!");
        setResetEmail('');
      } else {
        throw new Error(data.error || 'Failed to send password reset email');
      }
    } catch (error: any) {
      console.error('Error sending password reset:', error);
      toast.error(error.message || "Failed to send password reset email");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Create New User */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create New User Account
          </CardTitle>
          <CardDescription>
            Create a new user account and send welcome email with login credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="role">User Role</Label>
              <Select value={createForm.role} onValueChange={(value) => setCreateForm({ ...createForm, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User (Student)</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating User...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User Account
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Send Password Reset */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Password Reset Email
          </CardTitle>
          <CardDescription>
            Send a password reset link to an existing user's email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendPasswordReset} className="space-y-4">
            <div>
              <Label htmlFor="resetEmail">User Email Address</Label>
              <Input
                id="resetEmail"
                type="email"
                placeholder="user@example.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={resetLoading} className="w-full md:w-auto">
              {resetLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending Reset Email...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Password Reset
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800">Important Security Notes</h4>
              <ul className="mt-2 text-sm text-amber-700 space-y-1">
                <li>• Only employees can create user accounts</li>
                <li>• New users receive a temporary password via email</li>
                <li>• Users should change their password after first login</li>
                <li>• Public user registration is disabled for security</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};