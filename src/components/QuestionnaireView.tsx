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

interface LORRecommender {
  name: string;
  designation: string;
  institution: string;
  email: string;
  phone?: string | null;
  relationship_type?: string | null;
  relationship_duration?: string | null;
  courses_projects?: string | null;
  key_strengths?: string | null;
  specific_examples?: string | null;
  grades_performance?: string | null;
  research_experience?: string | null;
  leadership_roles?: string | null;
  communication_skills?: string | null;
  recommendation_strength?: string | null;
}

interface LORResponse {
  id: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
  recommenders: LORRecommender[];
}

const coerceValue = (value?: string | null) => value ?? "";

const normalizeLORRecommenders = (payload: any): LORRecommender[] => {
  if (!payload) return [];

  if (Array.isArray(payload.recommenders) && payload.recommenders.length > 0) {
    return payload.recommenders
      .map((item: any) => ({
        name: coerceValue(item?.name ?? item?.recommender_name),
        designation: coerceValue(item?.designation ?? item?.recommender_designation),
        institution: coerceValue(item?.institution ?? item?.recommender_institution),
        email: coerceValue(item?.email ?? item?.recommender_email),
        phone: item?.phone ?? null,
        relationship_type: item?.relationship_type ?? null,
        relationship_duration: item?.relationship_duration ?? null,
        courses_projects: item?.courses_projects ?? null,
        key_strengths: item?.key_strengths ?? null,
        specific_examples: item?.specific_examples ?? null,
        grades_performance: item?.grades_performance ?? null,
        research_experience: item?.research_experience ?? null,
        leadership_roles: item?.leadership_roles ?? null,
        communication_skills: item?.communication_skills ?? null,
        recommendation_strength: item?.recommendation_strength ?? null,
      }))
      .filter((entry: LORRecommender) => entry.name.trim().length > 0);
  }

  if (payload.recommender_name) {
    return [
      {
        name: coerceValue(payload.recommender_name),
        designation: coerceValue(payload.recommender_designation),
        institution: coerceValue(payload.recommender_institution),
        email: coerceValue(payload.recommender_email),
        phone: payload.recommender_phone ?? null,
        relationship_type: payload.relationship_type ?? null,
        relationship_duration: payload.relationship_duration ?? null,
        courses_projects: payload.courses_projects ?? null,
        key_strengths: payload.key_strengths ?? null,
        specific_examples: payload.specific_examples ?? null,
        grades_performance: payload.grades_performance ?? null,
        research_experience: payload.research_experience ?? null,
        leadership_roles: payload.leadership_roles ?? null,
        communication_skills: payload.communication_skills ?? null,
        recommendation_strength: payload.recommendation_strength ?? null,
      },
    ];
  }

  return [];
};

const buildLORResponse = (payload: any | null): LORResponse | null => {
  if (!payload) return null;
  return {
    id: payload.id,
    user_id: payload.user_id ?? undefined,
    created_at: payload.created_at || new Date().toISOString(),
    updated_at: payload.updated_at || new Date().toISOString(),
    recommenders: normalizeLORRecommenders(payload),
  };
};

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
      setLORResponse(lorData as any);

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
              <CardContent className="space-y-6">
                {lorResponse.recommenders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No recommender information submitted.
                  </p>
                ) : (
                  lorResponse.recommenders.map((recommender, index) => (
                    <div
                      key={`${recommender.email}-${index}`}
                      className="space-y-4 rounded-lg border border-dashed p-4"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h4 className="text-base font-semibold text-foreground">{recommender.name}</h4>
                          <p className="text-sm text-muted-foreground">{recommender.designation}</p>
                          <p className="text-sm text-muted-foreground">{recommender.institution}</p>
                        </div>
                        <Badge variant="secondary">Recommender {index + 1}</Badge>
                      </div>

                      <div className="grid gap-4 text-sm md:grid-cols-2">
                        <div>
                          <strong>Email:</strong>
                          <p className="text-muted-foreground">{recommender.email}</p>
                        </div>
                        {recommender.phone && (
                          <div>
                            <strong>Phone:</strong>
                            <p className="text-muted-foreground">{recommender.phone}</p>
                          </div>
                        )}
                        <div>
                          <strong>Recommendation Strength:</strong>
                          <p className="text-muted-foreground">{recommender.recommendation_strength ?? "Not specified"}</p>
                        </div>
                        {recommender.relationship_duration && (
                          <div>
                            <strong>Relationship Duration:</strong>
                            <p className="text-muted-foreground">{recommender.relationship_duration}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 text-sm">
                        {recommender.relationship_type && (
                          <div>
                            <strong>Relationship Context:</strong>
                            <p className="mt-1 whitespace-pre-line text-muted-foreground">
                              {recommender.relationship_type}
                            </p>
                          </div>
                        )}
                        {recommender.courses_projects && (
                          <div>
                            <strong>Courses & Projects:</strong>
                            <p className="mt-1 whitespace-pre-line text-muted-foreground">
                              {recommender.courses_projects}
                            </p>
                          </div>
                        )}
                        {recommender.key_strengths && (
                          <div>
                            <strong>Key Strengths:</strong>
                            <p className="mt-1 whitespace-pre-line text-muted-foreground">
                              {recommender.key_strengths}
                            </p>
                          </div>
                        )}
                        {recommender.specific_examples && (
                          <div>
                            <strong>Specific Examples:</strong>
                            <p className="mt-1 whitespace-pre-line text-muted-foreground">
                              {recommender.specific_examples}
                            </p>
                          </div>
                        )}
                        {recommender.grades_performance && (
                          <div>
                            <strong>Grades & Performance:</strong>
                            <p className="mt-1 whitespace-pre-line text-muted-foreground">
                              {recommender.grades_performance}
                            </p>
                          </div>
                        )}
                        {recommender.research_experience && (
                          <div>
                            <strong>Research Experience:</strong>
                            <p className="mt-1 whitespace-pre-line text-muted-foreground">
                              {recommender.research_experience}
                            </p>
                          </div>
                        )}
                        {recommender.leadership_roles && (
                          <div>
                            <strong>Leadership Roles:</strong>
                            <p className="mt-1 whitespace-pre-line text-muted-foreground">
                              {recommender.leadership_roles}
                            </p>
                          </div>
                        )}
                        {recommender.communication_skills && (
                          <div>
                            <strong>Communication Skills:</strong>
                            <p className="mt-1 whitespace-pre-line text-muted-foreground">
                              {recommender.communication_skills}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
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





