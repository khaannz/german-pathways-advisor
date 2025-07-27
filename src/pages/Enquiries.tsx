import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import Header from '@/components/Header';
import EnquiryForm from '@/components/EnquiryForm';
import EnquiryList from '@/components/EnquiryList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, List } from 'lucide-react';

const Enquiries = () => {
  const { user, loading } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading...</p>
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
            <p className="text-muted-foreground">Please sign in to submit enquiries.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleEnquirySuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Contact Support</h1>
            <p className="text-muted-foreground">
              Submit your enquiries and track their status
            </p>
          </div>

          <Tabs defaultValue="submit" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="submit" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Submit Enquiry
              </TabsTrigger>
              <TabsTrigger value="track" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Track Enquiries
              </TabsTrigger>
            </TabsList>

            <TabsContent value="submit">
              <EnquiryForm onSuccess={handleEnquirySuccess} />
            </TabsContent>

            <TabsContent value="track">
              <EnquiryList refresh={refreshKey} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Enquiries;