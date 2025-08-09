import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmployee?: boolean;
  requireStudent?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requireEmployee = false, 
  requireStudent = false,
  redirectTo = '/auth' 
}: ProtectedRouteProps) {
  const { user, isEmployee, loading, userRole } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!loading && userRole !== null) {
      setChecking(false);
    }
  }, [loading, userRole]);

  if (loading || checking) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requireEmployee && !isEmployee) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-muted-foreground mb-4">
                  This page is only accessible to employees.
                </p>
                <Button onClick={() => window.location.href = '/dashboard'} className="mt-4">
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (requireStudent && isEmployee) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-muted-foreground mb-4">
                  This page is only accessible to students.
                </p>
                <Button onClick={() => window.location.href = '/employee-dashboard'} className="mt-4">
                  Go to Employee Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return <>{children}</>;
}