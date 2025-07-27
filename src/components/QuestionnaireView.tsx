import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Download } from "lucide-react";

interface QuestionnaireViewProps {
  selectedStudentId: string | null;
}

interface SOPResponse {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  nationality: string;
  date_of_birth: string;
  linked_in: string;
  current_education_status: string;
  intended_program: string;
  target_universities: string;
  why_this_program: string;
  why_germany: string;
  short_term_goals: string;
  long_term_goals: string;
  has_thesis: boolean;
  thesis_details: string;
  academic_projects: string;
  work_experience: string;
  personal_qualities: string;
  challenges_accomplishments: string;
  created_at: string;
  updated_at: string;
}

interface LORResponse {
  id: string;
  recommender_name: string;
  recommender_designation: string;
  recommender_institution: string;
  recommender_email: string;
  relationship_type: string;
  relationship_duration: string;
  courses_projects: string;
  key_strengths: string;
  specific_examples: string;
  grades_performance: string;
  created_at: string;
  updated_at: string;
}

interface CVResponse {
  id: string;
  education_history: string;
  work_experience: string;
  technical_skills: string;
  soft_skills: string;
  languages: string;
  certifications: string;
  extracurriculars: string;
  photo_url: string;
  created_at: string;
  updated_at: string;
}

export function QuestionnaireView({ selectedStudentId }: QuestionnaireViewProps) {
  const [sopResponse, setSOPResponse] = useState<SOPResponse | null>(null);
  const [lorResponse, setLORResponse] = useState<LORResponse | null>(null);
  const [cvResponse, setCVResponse] = useState<CVResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [sopOpen, setSOPOpen] = useState(false);
  const [lorOpen, setLOROpen] = useState(false);
  const [cvOpen, setCVOpen] = useState(false);

  useEffect(() => {
    if (selectedStudentId) {
      loadQuestionnaireData();
    } else {
      setSOPResponse(null);
      setLORResponse(null);
      setCVResponse(null);
    }
  }, [selectedStudentId]);

  const loadQuestionnaireData = async () => {
    if (!selectedStudentId) return;

    setLoading(true);
    try {
      // Load SOP response
      const { data: sopData, error: sopError } = await supabase
        .from("sop_responses")
        .select("*")
        .eq("user_id", selectedStudentId)
        .maybeSingle();

      if (sopError) throw sopError;
      setSOPResponse(sopData);

      // Load LOR response
      const { data: lorData, error: lorError } = await supabase
        .from("lor_responses")
        .select("*")
        .eq("user_id", selectedStudentId)
        .maybeSingle();

      if (lorError) throw lorError;
      setLORResponse(lorData);

      // Load CV response
      const { data: cvData, error: cvError } = await supabase
        .from("cv_responses")
        .select("*")
        .eq("user_id", selectedStudentId)
        .maybeSingle();

      if (cvError) throw cvError;
      setCVResponse(cvData);
    } catch (error) {
      console.error("Error loading questionnaire data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedStudentId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Select a student to view their questionnaire responses
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading questionnaire data...
      </div>
    );
  }

  const hasAnyResponse = sopResponse || lorResponse || cvResponse;

  if (!hasAnyResponse) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No questionnaire responses found for this student
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Questionnaire Responses</h3>
        <div className="flex gap-2">
          {sopResponse && <Badge variant="secondary">SOP</Badge>}
          {lorResponse && <Badge variant="secondary">LOR</Badge>}
          {cvResponse && <Badge variant="secondary">CV</Badge>}
        </div>
      </div>

      {/* Statement of Purpose */}
      {sopResponse && (
        <Card>
          <Collapsible open={sopOpen} onOpenChange={setSOPOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Statement of Purpose
                      {sopOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </CardTitle>
                    <CardDescription>
                      Last updated: {new Date(sopResponse.updated_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Personal Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {sopResponse.full_name}</p>
                      <p><strong>Email:</strong> {sopResponse.email}</p>
                      <p><strong>Phone:</strong> {sopResponse.phone}</p>
                      <p><strong>Nationality:</strong> {sopResponse.nationality}</p>
                      <p><strong>Date of Birth:</strong> {sopResponse.date_of_birth}</p>
                      {sopResponse.linked_in && (
                        <p><strong>LinkedIn:</strong> <a href={sopResponse.linked_in} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{sopResponse.linked_in}</a></p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Academic Background</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Current Education:</strong> {sopResponse.current_education_status}</p>
                      <p><strong>Intended Program:</strong> {sopResponse.intended_program}</p>
                      <p><strong>Target Universities:</strong> {sopResponse.target_universities}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Motivation</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <strong>Why This Program:</strong>
                        <p className="mt-1 text-muted-foreground">{sopResponse.why_this_program}</p>
                      </div>
                      <div>
                        <strong>Why Germany:</strong>
                        <p className="mt-1 text-muted-foreground">{sopResponse.why_germany}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Goals</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <strong>Short-term Goals:</strong>
                        <p className="mt-1 text-muted-foreground">{sopResponse.short_term_goals}</p>
                      </div>
                      <div>
                        <strong>Long-term Goals:</strong>
                        <p className="mt-1 text-muted-foreground">{sopResponse.long_term_goals}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Experience & Qualities</h4>
                    <div className="space-y-3 text-sm">
                      {sopResponse.has_thesis && sopResponse.thesis_details && (
                        <div>
                          <strong>Thesis/Research:</strong>
                          <p className="mt-1 text-muted-foreground">{sopResponse.thesis_details}</p>
                        </div>
                      )}
                      <div>
                        <strong>Academic Projects:</strong>
                        <p className="mt-1 text-muted-foreground">{sopResponse.academic_projects}</p>
                      </div>
                      <div>
                        <strong>Work Experience:</strong>
                        <p className="mt-1 text-muted-foreground">{sopResponse.work_experience}</p>
                      </div>
                      <div>
                        <strong>Personal Qualities:</strong>
                        <p className="mt-1 text-muted-foreground">{sopResponse.personal_qualities}</p>
                      </div>
                      <div>
                        <strong>Challenges & Accomplishments:</strong>
                        <p className="mt-1 text-muted-foreground">{sopResponse.challenges_accomplishments}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Letter of Recommendation */}
      {lorResponse && (
        <Card>
          <Collapsible open={lorOpen} onOpenChange={setLOROpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Letter of Recommendation
                      {lorOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </CardTitle>
                    <CardDescription>
                      Last updated: {new Date(lorResponse.updated_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Recommender Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Name:</strong> {lorResponse.recommender_name}</p>
                      <p><strong>Designation:</strong> {lorResponse.recommender_designation}</p>
                    </div>
                    <div>
                      <p><strong>Institution:</strong> {lorResponse.recommender_institution}</p>
                      <p><strong>Email:</strong> {lorResponse.recommender_email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <strong>Relationship Type:</strong>
                    <p className="mt-1 text-muted-foreground">{lorResponse.relationship_type}</p>
                  </div>
                  <div>
                    <strong>Relationship Duration:</strong>
                    <p className="mt-1 text-muted-foreground">{lorResponse.relationship_duration}</p>
                  </div>
                  <div>
                    <strong>Courses/Projects Together:</strong>
                    <p className="mt-1 text-muted-foreground">{lorResponse.courses_projects}</p>
                  </div>
                  <div>
                    <strong>Key Strengths:</strong>
                    <p className="mt-1 text-muted-foreground">{lorResponse.key_strengths}</p>
                  </div>
                  <div>
                    <strong>Specific Examples:</strong>
                    <p className="mt-1 text-muted-foreground">{lorResponse.specific_examples}</p>
                  </div>
                  <div>
                    <strong>Academic/Work Performance:</strong>
                    <p className="mt-1 text-muted-foreground">{lorResponse.grades_performance}</p>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Curriculum Vitae */}
      {cvResponse && (
        <Card>
          <Collapsible open={cvOpen} onOpenChange={setCVOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Curriculum Vitae (CV)
                      {cvOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </CardTitle>
                    <CardDescription>
                      Last updated: {new Date(cvResponse.updated_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {cvResponse.photo_url && (
                  <div>
                    <h4 className="font-semibold mb-2">Professional Photo</h4>
                    <div className="flex items-center gap-4">
                      <img
                        src={cvResponse.photo_url}
                        alt="Professional photo"
                        className="w-24 h-24 object-cover rounded-md"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(cvResponse.photo_url, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Photo
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3 text-sm">
                  <div>
                    <strong>Education History:</strong>
                    <p className="mt-1 text-muted-foreground">{cvResponse.education_history}</p>
                  </div>
                  <div>
                    <strong>Work Experience:</strong>
                    <p className="mt-1 text-muted-foreground">{cvResponse.work_experience}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <strong>Technical Skills:</strong>
                      <p className="mt-1 text-muted-foreground">{cvResponse.technical_skills}</p>
                    </div>
                    <div>
                      <strong>Soft Skills:</strong>
                      <p className="mt-1 text-muted-foreground">{cvResponse.soft_skills}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <strong>Languages:</strong>
                      <p className="mt-1 text-muted-foreground">{cvResponse.languages}</p>
                    </div>
                    <div>
                      <strong>Certifications:</strong>
                      <p className="mt-1 text-muted-foreground">{cvResponse.certifications}</p>
                    </div>
                  </div>

                  <div>
                    <strong>Extracurricular Activities:</strong>
                    <p className="mt-1 text-muted-foreground">{cvResponse.extracurriculars}</p>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}
    </div>
  );
}