import React from 'react';
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ROLE_PERMISSIONS, DownloadManager } from '@/utils/downloadManager';
import { Download, FileType, Shield, AlertTriangle, CheckCircle, X, Info } from 'lucide-react';

interface DownloadPermissionsProps {
  className?: string;
}

const DownloadPermissions: React.FC<DownloadPermissionsProps> = ({ className }) => {
  const { userRole } = useAuth();
  const permissions = ROLE_PERMISSIONS[userRole || 'user'];

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'No limit';
    return DownloadManager.formatFileSize(bytes);
  };

  const getPermissionIcon = (allowed: boolean) => {
    return allowed ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <X className="h-4 w-4 text-red-600" />
    );
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive' as const;
      case 'employee':
        return 'default' as const;
      default:
        return 'secondary' as const;
    }
  };

  const getAllowedFormatsDisplay = () => {
    if (permissions.allowedFormats.includes('*')) {
      return 'All file formats';
    }
    return permissions.allowedFormats.join(', ').toUpperCase();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Download Permissions
        </CardTitle>
        <CardDescription>
          Your current download capabilities and restrictions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Role Information */}
        <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Your Role</p>
              <p className="text-sm text-muted-foreground">Current access level</p>
            </div>
          </div>
          <Badge variant={getRoleBadgeVariant(userRole || 'user')} className="capitalize">
            {userRole || 'user'}
          </Badge>
        </div>

        {/* Basic Permissions */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Capabilities
          </h3>
          
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getPermissionIcon(permissions.canDownload)}
                <span className="text-sm font-medium">Download Files</span>
              </div>
              <Badge variant={permissions.canDownload ? 'default' : 'secondary'}>
                {permissions.canDownload ? 'Allowed' : 'Restricted'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileType className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Allowed Formats</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {getAllowedFormatsDisplay()}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Info className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">File Size Limit</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatFileSize(permissions.maxFileSize)}
              </span>
            </div>

            {permissions.requiresApproval && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Requires Approval</span>
                </div>
                <Badge variant="outline">Required</Badge>
              </div>
            )}
          </div>
        </div>

        {/* Role-specific Features */}
        {userRole === 'employee' || userRole === 'admin' ? (
          <div className="space-y-4">
            <h3 className="font-semibold">Employee Features</h3>
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Bulk Download</span>
                </div>
                <Badge variant="default">Available</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Export User Data</span>
                </div>
                <Badge variant="default">Available</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Download Statistics</span>
                </div>
                <Badge variant="default">Available</Badge>
              </div>
            </div>
          </div>
        ) : null}

        {userRole === 'admin' ? (
          <div className="space-y-4">
            <h3 className="font-semibold">Admin Features</h3>
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Unrestricted Access</span>
                </div>
                <Badge variant="destructive">Full Access</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">All File Formats</span>
                </div>
                <Badge variant="destructive">No Restrictions</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">No Size Limits</span>
                </div>
                <Badge variant="destructive">Unlimited</Badge>
              </div>
            </div>
          </div>
        ) : null}

        {/* Security Notice */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            {userRole === 'admin' ? (
              "As an admin, you have unrestricted download access. Please use these privileges responsibly and in accordance with data protection policies."
            ) : userRole === 'employee' ? (
              "As an employee, you have enhanced download capabilities to support student consultations. All downloads are logged for security purposes."
            ) : (
              "Your downloads are subject to security policies. Contact support if you need access to restricted file types or larger files."
            )}
          </AlertDescription>
        </Alert>

        {/* Format Support Details */}
        <div className="space-y-4">
          <h3 className="font-semibold">Supported File Formats</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {['PDF', 'DOCX', 'JPG', 'PNG'].map((format) => (
              <div key={format} className="flex items-center gap-2 p-2 border rounded">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium">{format}</span>
              </div>
            ))}
            {(userRole === 'employee' || userRole === 'admin') && ['XLSX', 'TXT', 'ZIP'].map((format) => (
              <div key={format} className="flex items-center gap-2 p-2 border rounded bg-blue-50">
                <CheckCircle className="h-3 w-3 text-blue-600" />
                <span className="text-xs font-medium">{format}</span>
              </div>
            ))}
            {userRole === 'admin' && (
              <div className="flex items-center gap-2 p-2 border rounded bg-red-50 col-span-full">
                <CheckCircle className="h-3 w-3 text-red-600" />
                <span className="text-xs font-medium">All Other Formats</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DownloadPermissions;

