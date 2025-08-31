import React from 'react';
import { useAuth } from '@/components/AuthContext';
import EnquiryManagement from './EnquiryManagement';

interface EnquiryListProps {
  refresh?: number;
}

const EnquiryList: React.FC<EnquiryListProps> = ({ refresh }) => {
  const { user } = useAuth();

  return (
    <EnquiryManagement 
      userId={user?.id} 
      currentUserId={user?.id}
      isEmployee={false}
    />
  );
};

export default EnquiryList;