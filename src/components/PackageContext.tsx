import React, { createContext, useContext, useState, useEffect } from 'react';

export type ConsultationPackage = 'essential' | 'premium' | 'vip' | null;

export interface PackageFeatures {
  university_shortlist_limit: number;
  sop_revisions: number;
  lor_assistance: boolean;
  cv_writing: boolean;
  video_calls: boolean;
  personal_consultant: boolean;
  priority_support: boolean;
  scholarship_assistance: boolean;
  post_arrival_support: boolean;
  unlimited_revisions: boolean;
}

export interface UserPackage {
  package: ConsultationPackage;
  features: PackageFeatures;
  expiryDate: string | null;
  purchaseDate: string | null;
  usage: {
    sopRevisions: number;
    lorRequests: number;
    videoCalls: number;
  };
}

interface PackageContextType {
  userPackage: UserPackage | null;
  hasFeature: (feature: keyof PackageFeatures) => boolean;
  canUseFeature: (feature: string) => boolean;
  getFeatureLimit: (feature: string) => number;
  isPackageExpired: () => boolean;
}

const PackageContext = createContext<PackageContextType | undefined>(undefined);

export const usePackage = () => {
  const context = useContext(PackageContext);
  if (context === undefined) {
    throw new Error('usePackage must be used within a PackageProvider');
  }
  return context;
};

const getPackageFeatures = (packageType: ConsultationPackage): PackageFeatures => {
  switch (packageType) {
    case 'essential':
      return {
        university_shortlist_limit: 5,
        sop_revisions: 1,
        lor_assistance: false,
        cv_writing: false,
        video_calls: false,
        personal_consultant: false,
        priority_support: false,
        scholarship_assistance: false,
        post_arrival_support: false,
        unlimited_revisions: false,
      };
    case 'premium':
      return {
        university_shortlist_limit: 10,
        sop_revisions: 3,
        lor_assistance: true,
        cv_writing: true,
        video_calls: false,
        personal_consultant: false,
        priority_support: true,
        scholarship_assistance: false,
        post_arrival_support: false,
        unlimited_revisions: false,
      };
    case 'vip':
      return {
        university_shortlist_limit: -1, // unlimited
        sop_revisions: -1, // unlimited
        lor_assistance: true,
        cv_writing: true,
        video_calls: true,
        personal_consultant: true,
        priority_support: true,
        scholarship_assistance: true,
        post_arrival_support: true,
        unlimited_revisions: true,
      };
    default:
      return {
        university_shortlist_limit: 0,
        sop_revisions: 0,
        lor_assistance: false,
        cv_writing: false,
        video_calls: false,
        personal_consultant: false,
        priority_support: false,
        scholarship_assistance: false,
        post_arrival_support: false,
        unlimited_revisions: false,
      };
  }
};

export const PackageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userPackage, setUserPackage] = useState<UserPackage | null>(null);

  // TODO: Replace with actual user data fetching
  useEffect(() => {
    // Fetch user package from Supabase
    const fetchUserPackage = async () => {
      // Mock data - replace with actual API call
      const mockPackage: UserPackage = {
        package: 'premium',
        features: getPackageFeatures('premium'),
        expiryDate: '2024-12-31',
        purchaseDate: '2024-06-01',
        usage: {
          sopRevisions: 1,
          lorRequests: 0,
          videoCalls: 0,
        },
      };
      setUserPackage(mockPackage);
    };

    fetchUserPackage();
  }, []);

  const hasFeature = (feature: keyof PackageFeatures): boolean => {
    if (!userPackage) return false;
    return userPackage.features[feature] === true;
  };

  const canUseFeature = (feature: string): boolean => {
    if (!userPackage) return false;
    if (isPackageExpired()) return false;

    switch (feature) {
      case 'sop_revision':
        return userPackage.features.unlimited_revisions || 
               userPackage.usage.sopRevisions < userPackage.features.sop_revisions;
      case 'lor_request':
        return userPackage.features.lor_assistance;
      case 'cv_writing':
        return userPackage.features.cv_writing;
      case 'video_call':
        return userPackage.features.video_calls;
      default:
        return false;
    }
  };

  const getFeatureLimit = (feature: string): number => {
    if (!userPackage) return 0;
    
    switch (feature) {
      case 'university_shortlist':
        return userPackage.features.university_shortlist_limit;
      case 'sop_revisions':
        return userPackage.features.sop_revisions;
      default:
        return 0;
    }
  };

  const isPackageExpired = (): boolean => {
    if (!userPackage?.expiryDate) return true;
    return new Date() > new Date(userPackage.expiryDate);
  };

  return (
    <PackageContext.Provider value={{
      userPackage,
      hasFeature,
      canUseFeature,
      getFeatureLimit,
      isPackageExpired,
    }}>
      {children}
    </PackageContext.Provider>
  );
};

// Example usage components
export const FeatureGuard: React.FC<{
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ feature, children, fallback }) => {
  const { canUseFeature } = usePackage();

  if (canUseFeature(feature)) {
    return <>{children}</>;
  }

  return <>{fallback || <div>This feature requires a higher package level.</div>}</>;
};

export const PackageUpgradePrompt: React.FC<{
  currentPackage: ConsultationPackage;
  requiredFeature: string;
}> = ({ currentPackage, requiredFeature }) => {
  const suggestedPackage = requiredFeature === 'video_calls' ? 'vip' : 'premium';
  
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-semibold text-yellow-800 mb-2">Upgrade Required</h3>
      <p className="text-yellow-700 text-sm mb-3">
        This feature is available in our {suggestedPackage} package.
      </p>
      <button className="bg-yellow-600 text-white px-4 py-2 rounded text-sm hover:bg-yellow-700">
        Upgrade to {suggestedPackage.charAt(0).toUpperCase() + suggestedPackage.slice(1)}
      </button>
    </div>
  );
};
