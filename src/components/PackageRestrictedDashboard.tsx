import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePackage, FeatureGuard, PackageUpgradePrompt } from '@/components/PackageContext';
import { 
  FileText, 
  Video, 
  Crown, 
  Lock, 
  CheckCircle,
  AlertCircle,
  Upload
} from 'lucide-react';

const PackageRestrictedDashboard: React.FC = () => {
  const { userPackage, canUseFeature, getFeatureLimit, isPackageExpired } = usePackage();

  if (!userPackage) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Active Package</h3>
          <p className="text-muted-foreground mb-4">
            Purchase a consultation package to access our services.
          </p>
          <Button>Choose Package</Button>
        </CardContent>
      </Card>
    );
  }

  if (isPackageExpired()) {
    return (
      <Card className="w-full max-w-md mx-auto border-red-200">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Package Expired</h3>
          <p className="text-muted-foreground mb-4">
            Your {userPackage.package} package has expired. Renew to continue using our services.
          </p>
          <Button variant="destructive">Renew Package</Button>
        </CardContent>
      </Card>
    );
  }

  const packageConfig = {
    essential: { color: 'bg-blue-100 text-blue-800', icon: FileText },
    premium: { color: 'bg-purple-100 text-purple-800', icon: Crown },
    vip: { color: 'bg-yellow-100 text-yellow-800', icon: Crown }
  };

  const config = packageConfig[userPackage.package!];
  const Icon = config.icon;

  return (
    <div className="space-y-6">
      {/* Package Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${config.color.split(' ')[0]}`}>
                <Icon className={`h-6 w-6 ${config.color.split(' ')[1]}`} />
              </div>
              <div>
                <CardTitle className="capitalize">{userPackage.package} Package</CardTitle>
                <CardDescription>
                  Expires: {userPackage.expiryDate}
                </CardDescription>
              </div>
            </div>
            <Badge className={config.color}>
              Active
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Feature Access Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* SOP Writing */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              SOP Writing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FeatureGuard 
              feature="sop_revision"
              fallback={
                <PackageUpgradePrompt 
                  currentPackage={userPackage.package}
                  requiredFeature="sop_revision"
                />
              }
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Revisions Used:</span>
                  <span className="font-medium">
                    {userPackage.usage.sopRevisions} / {
                      userPackage.features.unlimited_revisions ? '∞' : userPackage.features.sop_revisions
                    }
                  </span>
                </div>
                <Button 
                  className="w-full" 
                  disabled={!canUseFeature('sop_revision')}
                >
                  {canUseFeature('sop_revision') ? 'Request SOP Review' : 'Limit Reached'}
                </Button>
              </div>
            </FeatureGuard>
          </CardContent>
        </Card>

        {/* LOR Assistance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              LOR Assistance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FeatureGuard 
              feature="lor_request"
              fallback={
                <PackageUpgradePrompt 
                  currentPackage={userPackage.package}
                  requiredFeature="lor_assistance"
                />
              }
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Available in your package</span>
                </div>
                <Button className="w-full">
                  Get LOR Help
                </Button>
              </div>
            </FeatureGuard>
          </CardContent>
        </Card>

        {/* CV Writing */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="h-5 w-5" />
              CV Writing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FeatureGuard 
              feature="cv_writing"
              fallback={
                <PackageUpgradePrompt 
                  currentPackage={userPackage.package}
                  requiredFeature="cv_writing"
                />
              }
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Professional CV service</span>
                </div>
                <Button className="w-full">
                  Create Professional CV
                </Button>
              </div>
            </FeatureGuard>
          </CardContent>
        </Card>

        {/* Video Consultations */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Video className="h-5 w-5" />
              Video Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FeatureGuard 
              feature="video_call"
              fallback={
                <PackageUpgradePrompt 
                  currentPackage={userPackage.package}
                  requiredFeature="video_calls"
                />
              }
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>VIP Feature Available</span>
                </div>
                <Button className="w-full">
                  Schedule Video Call
                </Button>
              </div>
            </FeatureGuard>
          </CardContent>
        </Card>

        {/* University Shortlisting */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="h-5 w-5" />
              University Match
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Universities:</span>
                <span className="font-medium">
                  {getFeatureLimit('university_shortlist') === -1 ? 'Unlimited' : `Up to ${getFeatureLimit('university_shortlist')}`}
                </span>
              </div>
              <Button className="w-full">
                Get University Recommendations
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Package Upgrade */}
        {userPackage.package !== 'vip' && (
          <Card className="border-dashed border-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <Crown className="h-5 w-5" />
                Upgrade Package
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Unlock more features with {userPackage.package === 'essential' ? 'Premium' : 'VIP'} package
                </p>
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                  View Upgrade Options
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Usage Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Package Usage Summary</CardTitle>
          <CardDescription>Track your current package utilization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{userPackage.usage.sopRevisions}</div>
              <div className="text-sm text-muted-foreground">SOP Revisions Used</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{userPackage.usage.lorRequests}</div>
              <div className="text-sm text-muted-foreground">LOR Requests</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">{userPackage.usage.videoCalls}</div>
              <div className="text-sm text-muted-foreground">Video Calls</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PackageRestrictedDashboard;
