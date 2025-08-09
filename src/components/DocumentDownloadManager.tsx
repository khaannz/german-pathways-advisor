import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, FileText, Users, Loader2 } from 'lucide-react';
import { 
  generateCVWordDocument, 
  generateSOPWordDocument, 
  generateLORWordDocument,
  generateCVPDF,
  generateSOPPDF,
  generateLORPDF,
  CVResponse,
  SOPResponse,
  LORResponse,
  UserProfile,
  CVEducationEntry,
  CVWorkExperienceEntry,
  CompleteCVData,
  CompleteSOPData,
  CompleteLORData
} from '@/utils/documentExport';

interface DocumentDownloadManagerProps {
  selectedUserId: string;
  userName: string;
}

interface ResponseCounts {
  cv: number;
  sop: number;
  lor: number;
}

const DocumentDownloadManager: React.FC<DocumentDownloadManagerProps> = ({ 
  selectedUserId, 
  userName 
}) => {
  const { toast } = useToast();
  const [loadingCV, setLoadingCV] = useState(false);
  const [loadingSOP, setLoadingSOP] = useState(false);
  const [loadingLOR, setLoadingLOR] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [format, setFormat] = useState<'word' | 'pdf'>('word');
  const [responseCounts, setResponseCounts] = useState<ResponseCounts>({ cv: 0, sop: 0, lor: 0 });

  React.useEffect(() => {
    if (selectedUserId) {
      fetchResponseCounts();
    }
  }, [selectedUserId]);

  const fetchResponseCounts = async () => {
    try {
      // Get CV responses count
      const { count: cvCount } = await supabase
        .from('cv_responses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', selectedUserId);

      // Get SOP responses count
      const { count: sopCount } = await supabase
        .from('sop_responses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', selectedUserId);

      // Get LOR responses count
      const { count: lorCount } = await supabase
        .from('lor_responses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', selectedUserId);

      setResponseCounts({
        cv: cvCount || 0,
        sop: sopCount || 0,
        lor: lorCount || 0
      });
    } catch (error) {
      console.error('Error fetching response counts:', error);
    }
  };

  const downloadCV = async () => {
    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a user first",
        variant: "destructive",
      });
      return;
    }

    setLoadingCV(true);
    try {
      // Fetch CV response
      const { data: cvData, error: cvError } = await supabase
        .from('cv_responses')
        .select('*')
        .eq('user_id', selectedUserId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (cvError) {
        throw cvError;
      }

      if (!cvData) {
        toast({
          title: "No Data Found",
          description: "No CV responses found for this user",
          variant: "destructive",
        });
        return;
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', selectedUserId)
        .single();

      if (profileError) {
        console.warn('No profile found for user:', profileError);
      }

      // Fetch education entries
      const { data: educationData, error: educationError } = await supabase
        .from('cv_education_entries')
        .select('*')
        .eq('user_id', selectedUserId)
        .order('created_at', { ascending: false });

      if (educationError) {
        console.warn('No education entries found:', educationError);
      }

      // Fetch work experience entries
      const { data: workExperienceData, error: workError } = await supabase
        .from('cv_work_experience_entries')
        .select('*')
        .eq('user_id', selectedUserId)
        .order('created_at', { ascending: false });

      if (workError) {
        console.warn('No work experience entries found:', workError);
      }

      // Prepare complete CV data
      const completeCVData: CompleteCVData = {
        cvResponse: cvData as CVResponse,
        profile: profileData as UserProfile || {
          id: '',
          user_id: selectedUserId,
          full_name: '',
          phone: '',
          target_program: '',
          target_university: '',
          consultation_status: '',
          role: 'user',
          created_at: '',
          updated_at: ''
        },
        educationEntries: (educationData as CVEducationEntry[]) || [],
        workExperienceEntries: (workExperienceData as CVWorkExperienceEntry[]) || []
      };

      if (format === 'word') {
        await generateCVWordDocument(completeCVData, userName);
      } else {
        generateCVPDF(completeCVData, userName);
      }

      toast({
        title: "Download Successful",
        description: `CV downloaded as ${format.toUpperCase()} file`,
      });
    } catch (error) {
      console.error('Error downloading CV:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download CV. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingCV(false);
    }
  };

  const downloadSOP = async () => {
    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a user first",
        variant: "destructive",
      });
      return;
    }

    setLoadingSOP(true);
    try {
      // Fetch SOP response
      const { data: sopData, error: sopError } = await supabase
        .from('sop_responses')
        .select('*')
        .eq('user_id', selectedUserId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (sopError) {
        throw sopError;
      }

      if (!sopData) {
        toast({
          title: "No Data Found",
          description: "No SOP responses found for this user",
          variant: "destructive",
        });
        return;
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', selectedUserId)
        .single();

      if (profileError) {
        console.warn('No profile found for user:', profileError);
      }

      // Prepare complete SOP data
      const completeSOPData: CompleteSOPData = {
        sopResponse: sopData as SOPResponse,
        profile: profileData as UserProfile || {
          id: '',
          user_id: selectedUserId,
          full_name: '',
          phone: '',
          target_program: '',
          target_university: '',
          consultation_status: '',
          role: 'user',
          created_at: '',
          updated_at: ''
        }
      };

      if (format === 'word') {
        await generateSOPWordDocument(completeSOPData, userName);
      } else {
        generateSOPPDF(completeSOPData, userName);
      }

      toast({
        title: "Download Successful",
        description: `SOP downloaded as ${format.toUpperCase()} file`,
      });
    } catch (error) {
      console.error('Error downloading SOP:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download SOP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingSOP(false);
    }
  };

  const downloadLOR = async () => {
    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a user first",
        variant: "destructive",
      });
      return;
    }

    setLoadingLOR(true);
    try {
      // Fetch LOR response
      const { data: lorData, error: lorError } = await supabase
        .from('lor_responses')
        .select('*')
        .eq('user_id', selectedUserId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (lorError) {
        throw lorError;
      }

      if (!lorData) {
        toast({
          title: "No Data Found",
          description: "No LOR responses found for this user",
          variant: "destructive",
        });
        return;
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', selectedUserId)
        .single();

      if (profileError) {
        console.warn('No profile found for user:', profileError);
      }

      // Prepare complete LOR data
      const completeLORData: CompleteLORData = {
        lorResponse: lorData as LORResponse,
        profile: profileData as UserProfile || {
          id: '',
          user_id: selectedUserId,
          full_name: '',
          phone: '',
          target_program: '',
          target_university: '',
          consultation_status: '',
          role: 'user',
          created_at: '',
          updated_at: ''
        }
      };

      if (format === 'word') {
        await generateLORWordDocument(completeLORData, userName);
      } else {
        generateLORPDF(completeLORData, userName);
      }

      toast({
        title: "Download Successful",
        description: `LOR downloaded as ${format.toUpperCase()} file`,
      });
    } catch (error) {
      console.error('Error downloading LOR:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download LOR. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingLOR(false);
    }
  };

  const downloadAllResponses = async () => {
    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a user first",
        variant: "destructive",
      });
      return;
    }

    setLoadingAll(true);
    try {
      // Download all available responses sequentially
      if (responseCounts.cv > 0) {
        await downloadCV();
      }
      if (responseCounts.sop > 0) {
        await downloadSOP();
      }
      if (responseCounts.lor > 0) {
        await downloadLOR();
      }

      if (responseCounts.cv === 0 && responseCounts.sop === 0 && responseCounts.lor === 0) {
        toast({
          title: "No Data Found",
          description: "No responses found for this user",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Download Complete",
        description: "All available responses have been downloaded",
      });
    } catch (error) {
      console.error('Error downloading all responses:', error);
      toast({
        title: "Download Failed",
        description: "Some downloads may have failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingAll(false);
    }
  };

  if (!selectedUserId) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No User Selected</p>
            <p className="text-sm">Please select a user to download their responses</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalResponses = responseCounts.cv + responseCounts.sop + responseCounts.lor;

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-orange-50 dark:from-purple-950/20 dark:to-orange-950/20 border border-purple-200 dark:border-purple-800">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <Download className="h-6 w-6 text-primary" />
          Document Export Center
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>Export responses for: </span>
          <Badge variant="outline" className="bg-white/80">
            {userName}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Export Format
          </label>
          <Select value={format} onValueChange={(value: 'word' | 'pdf') => setFormat(value)}>
            <SelectTrigger className="bg-white/80 dark:bg-slate-800/80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="word">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Microsoft Word (.docx)
                </div>
              </SelectItem>
              <SelectItem value="pdf">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-red-600" />
                  PDF Document (.pdf)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Response Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{responseCounts.cv}</div>
            <div className="text-xs text-muted-foreground">CV Responses</div>
          </div>
          <div className="text-center p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{responseCounts.sop}</div>
            <div className="text-xs text-muted-foreground">SOP Responses</div>
          </div>
          <div className="text-center p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border">
            <div className="text-2xl font-bold text-purple-600">{responseCounts.lor}</div>
            <div className="text-xs text-muted-foreground">LOR Responses</div>
          </div>
        </div>

        {/* Individual Download Buttons */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-foreground mb-2">
            Individual Downloads
          </div>
          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={downloadCV}
              disabled={loadingCV || responseCounts.cv === 0}
              variant="outline"
              className="justify-start bg-white/80 hover:bg-blue-50 border-blue-200"
            >
              {loadingCV ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2 text-blue-600" />
              )}
              Download CV Responses
              {responseCounts.cv === 0 && (
                <Badge variant="secondary" className="ml-auto">
                  No Data
                </Badge>
              )}
            </Button>

            <Button
              onClick={downloadSOP}
              disabled={loadingSOP || responseCounts.sop === 0}
              variant="outline"
              className="justify-start bg-white/80 hover:bg-green-50 border-green-200"
            >
              {loadingSOP ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2 text-green-600" />
              )}
              Download SOP Responses
              {responseCounts.sop === 0 && (
                <Badge variant="secondary" className="ml-auto">
                  No Data
                </Badge>
              )}
            </Button>

            <Button
              onClick={downloadLOR}
              disabled={loadingLOR || responseCounts.lor === 0}
              variant="outline"
              className="justify-start bg-white/80 hover:bg-purple-50 border-purple-200"
            >
              {loadingLOR ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2 text-purple-600" />
              )}
              Download LOR Responses
              {responseCounts.lor === 0 && (
                <Badge variant="secondary" className="ml-auto">
                  No Data
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Bulk Download */}
        <div className="pt-4 border-t border-purple-200 dark:border-purple-800">
          <Button
            onClick={downloadAllResponses}
            disabled={loadingAll || totalResponses === 0}
            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-purple-700 hover:to-purple-800 text-white font-semibold"
            size="lg"
          >
            {loadingAll ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Download All Available Responses
                {totalResponses > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-white text-purple-700">
                    {totalResponses} files
                  </Badge>
                )}
              </>
            )}
          </Button>
          {totalResponses === 0 && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              No responses available for download
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentDownloadManager;
