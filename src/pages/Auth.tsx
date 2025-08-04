import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const { signIn, signUp, resetPassword, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  // Sign In form
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInErrors, setSignInErrors] = useState<{email?: string, password?: string}>({});
  
  // Sign Up form
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [signUpErrors, setSignUpErrors] = useState<{email?: string, password?: string, fullName?: string}>({});

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Form validation functions
  const validateSignInForm = () => {
    const errors: {email?: string, password?: string} = {};
    
    if (!signInEmail) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(signInEmail)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!signInPassword) {
      errors.password = 'Password is required';
    }
    
    setSignInErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSignUpForm = () => {
    const errors: {email?: string, password?: string, fullName?: string} = {};
    
    if (!fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }
    
    if (!signUpEmail) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(signUpEmail)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!signUpPassword) {
      errors.password = 'Password is required';
    } else if (signUpPassword.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setSignUpErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateResetEmail = () => {
    if (!resetEmail) {
      return 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(resetEmail)) {
      return 'Please enter a valid email';
    }
    return null;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignInForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await signIn(signInEmail, signInPassword);
      
      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignUpForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await signUp(signUpEmail, signUpPassword, fullName);
      
      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account.",
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailError = validateResetEmail();
    if (emailError) {
      toast({
        title: "Invalid Email",
        description: emailError,
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await resetPassword(resetEmail);
      
      if (error) {
        toast({
          title: "Reset Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Reset Email Sent!",
          description: "Please check your email for password reset instructions.",
          variant: "default",
        });
        setResetPasswordMode(false);
        setResetEmail('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (resetPasswordMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-card/80">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setResetPasswordMode(false)}
                  className="p-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <CardTitle className="text-2xl text-foreground">Reset Password</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                Enter your email address and we'll send you a link to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-sm font-medium text-foreground">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="Enter your email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading}
                  variant="hero"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-primary to-accent">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">
            Access your German university consultation portal
          </p>
        </div>

        <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-card/80">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-foreground">Account Access</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4 mt-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-sm font-medium text-foreground">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signInEmail}
                        onChange={(e) => {
                          setSignInEmail(e.target.value);
                          if (signInErrors.email) {
                            setSignInErrors(prev => ({...prev, email: undefined}));
                          }
                        }}
                        className={`pl-10 ${signInErrors.email ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {signInErrors.email && (
                      <p className="text-sm text-destructive">{signInErrors.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-sm font-medium text-foreground">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Enter your password"
                        value={signInPassword}
                        onChange={(e) => {
                          setSignInPassword(e.target.value);
                          if (signInErrors.password) {
                            setSignInErrors(prev => ({...prev, password: undefined}));
                          }
                        }}
                        className={`pl-10 ${signInErrors.password ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {signInErrors.password && (
                      <p className="text-sm text-destructive">{signInErrors.password}</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={() => setResetPasswordMode(true)}
                      className="px-0 text-primary hover:text-primary/80"
                    >
                      Forgot password?
                    </Button>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                    variant="hero"
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-medium text-foreground">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (signUpErrors.fullName) {
                            setSignUpErrors(prev => ({...prev, fullName: undefined}));
                          }
                        }}
                        className={`pl-10 ${signUpErrors.fullName ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {signUpErrors.fullName && (
                      <p className="text-sm text-destructive">{signUpErrors.fullName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium text-foreground">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signUpEmail}
                        onChange={(e) => {
                          setSignUpEmail(e.target.value);
                          if (signUpErrors.email) {
                            setSignUpErrors(prev => ({...prev, email: undefined}));
                          }
                        }}
                        className={`pl-10 ${signUpErrors.email ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {signUpErrors.email && (
                      <p className="text-sm text-destructive">{signUpErrors.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium text-foreground">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password (min. 6 characters)"
                        value={signUpPassword}
                        onChange={(e) => {
                          setSignUpPassword(e.target.value);
                          if (signUpErrors.password) {
                            setSignUpErrors(prev => ({...prev, password: undefined}));
                          }
                        }}
                        className={`pl-10 ${signUpErrors.password ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {signUpErrors.password && (
                      <p className="text-sm text-destructive">{signUpErrors.password}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                    variant="hero"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Need help? Contact us at{' '}
            <a href="mailto:support@germanyeducation.com" className="text-primary hover:underline">
              support@germanyeducation.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;