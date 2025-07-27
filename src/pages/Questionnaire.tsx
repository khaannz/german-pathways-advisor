import { Header } from "@/components/Header";
import { SOPForm } from "@/components/forms/SOPForm";
import { LORForm } from "@/components/forms/LORForm";
import { CVForm } from "@/components/forms/CVForm";

export function Questionnaire() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">
            Application Questionnaire
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Complete each section separately. Your progress is automatically saved.
          </p>
          
          <div className="space-y-8">
            <SOPForm />
            <LORForm />
            <CVForm />
          </div>
        </div>
      </div>
    </div>
  );
}
  // Personal Information
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(5, "Phone number is required"),
  nationality: z.string().min(2, "Nationality is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  linkedIn: z.string().optional(),
  
  // SOP Section
  currentEducationStatus: z.enum(["undergraduate", "graduate", "working_professional", "gap_year"]),
  intendedProgram: z.string().min(5, "Please specify your intended program"),
  targetUniversities: z.string().min(5, "Please list your target universities"),
  whyThisProgram: z.string().min(50, "Please provide at least 50 characters"),
  whyGermany: z.string().min(50, "Please provide at least 50 characters"),
  shortTermGoals: z.string().min(30, "Please describe your short-term goals"),
  longTermGoals: z.string().min(30, "Please describe your long-term goals"),
  hasThesis: z.enum(["yes", "no"]),
  thesisDetails: z.string().optional(),
  academicProjects: z.string().optional(),
  workExperience: z.string().optional(),
  personalQualities: z.string().min(30, "Please describe your personal qualities"),
  challengesAccomplishments: z.string().optional(),
  
  // LOR Section
  recommenderName: z.string().min(2, "Recommender name is required"),
  recommenderDesignation: z.string().min(2, "Designation is required"),
  recommenderInstitution: z.string().min(2, "Institution is required"),
  recommenderEmail: z.string().email("Valid email is required"),
  relationshipType: z.enum(["professor", "supervisor", "employer", "mentor", "other"]),
  relationshipDuration: z.string().min(1, "Duration is required"),
  coursesProjects: z.string().min(10, "Please describe courses/projects worked on together"),
  keyStrengths: z.string().min(30, "Please describe key strengths to highlight"),
  specificExamples: z.string().min(30, "Please provide specific examples"),
  gradesPerformance: z.string().optional(),
  
  // CV Section
  educationHistory: z.string().min(20, "Please provide your educational background"),
  workExperienceCV: z.string().optional(),
  technicalSkills: z.string().min(10, "Please list your technical skills"),
  softSkills: z.string().min(10, "Please list your soft skills"),
  languages: z.string().min(5, "Please list languages with proficiency levels"),
  certifications: z.string().optional(),
  extracurriculars: z.string().optional(),
});

type QuestionnaireForm = z.infer<typeof questionnaireSchema>;

export default function Questionnaire() {
  const [activeTab, setActiveTab] = useState("sop");
  const { toast } = useToast();
  
  const form = useForm<QuestionnaireForm>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: {
      currentEducationStatus: "undergraduate",
      hasThesis: "no",
      relationshipType: "professor",
    },
  });

  const watchHasThesis = form.watch("hasThesis");

  const onSubmit = (data: QuestionnaireForm) => {
    console.log("Form submitted:", data);
    toast({
      title: "Questionnaire Submitted!",
      description: "Your information has been saved successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Student Application Questionnaire
            </h1>
            <p className="text-muted-foreground">
              Complete this comprehensive form to generate your SOP, LOR template, and professional CV
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="sop" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Statement of Purpose
                  </TabsTrigger>
                  <TabsTrigger value="lor" className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Letter of Recommendation
                  </TabsTrigger>
                  <TabsTrigger value="cv" className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Curriculum Vitae
                  </TabsTrigger>
                </TabsList>

                {/* Personal Information Section */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Basic details used across all documents</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input placeholder="your.email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="+49 xxx xxx xxxx" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="nationality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nationality *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your nationality" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="linkedIn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn Profile</FormLabel>
                          <FormControl>
                            <Input placeholder="https://linkedin.com/in/yourprofile" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <TabsContent value="sop" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Statement of Purpose Information</CardTitle>
                      <CardDescription>Details to craft your compelling SOP</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="currentEducationStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Education Status *</FormLabel>
                            <FormControl>
                              <RadioGroup onValueChange={field.onChange} defaultValue={field.value}>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="undergraduate" id="undergraduate" />
                                  <label htmlFor="undergraduate">Currently pursuing undergraduate degree</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="graduate" id="graduate" />
                                  <label htmlFor="graduate">Completed undergraduate degree</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="working_professional" id="working" />
                                  <label htmlFor="working">Working professional</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="gap_year" id="gap" />
                                  <label htmlFor="gap">Taking a gap year</label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="intendedProgram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Intended Master's Program *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Master of Science in Computer Science" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="targetUniversities"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Universities *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="List your target universities (e.g., TU Munich, RWTH Aachen, University of Stuttgart)"
                                className="min-h-[80px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="whyThisProgram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Why do you want to pursue this specific program? *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Explain your motivation, interests, and how this program aligns with your goals"
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="whyGermany"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Why are you choosing to study in Germany? *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Discuss Germany's education system, research opportunities, culture, etc."
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="shortTermGoals"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Short-term Career Goals *</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Goals for the next 2-3 years"
                                  className="min-h-[100px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="longTermGoals"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Long-term Career Goals *</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Goals for the next 5-10 years"
                                  className="min-h-[100px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="hasThesis"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Have you completed a thesis or major research project? *</FormLabel>
                            <FormControl>
                              <RadioGroup onValueChange={field.onChange} defaultValue={field.value}>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="yes" id="thesis-yes" />
                                  <label htmlFor="thesis-yes">Yes</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="no" id="thesis-no" />
                                  <label htmlFor="thesis-no">No</label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {watchHasThesis === "yes" && (
                        <FormField
                          control={form.control}
                          name="thesisDetails"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Thesis/Research Details</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe your thesis topic, methodology, key findings, and relevance"
                                  className="min-h-[120px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      <FormField
                        control={form.control}
                        name="academicProjects"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Academic Projects</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe relevant academic projects, coursework, or research experiences"
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="workExperience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Work Experience & Internships</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your work experience, internships, or volunteering activities"
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="personalQualities"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Personal Qualities *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="What personal qualities make you a good fit for this program?"
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="challengesAccomplishments"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Challenges & Accomplishments</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Any personal challenges overcome or significant accomplishments you'd like to highlight"
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="lor" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Letter of Recommendation Information</CardTitle>
                      <CardDescription>Details to help your recommender write a strong LOR</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="recommenderName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Recommender's Full Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Prof. Dr. John Smith" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="recommenderDesignation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Designation/Title *</FormLabel>
                              <FormControl>
                                <Input placeholder="Professor, Senior Manager, etc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="recommenderInstitution"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Institution/Company *</FormLabel>
                              <FormControl>
                                <Input placeholder="University/Company name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="recommenderEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Recommender's Email *</FormLabel>
                              <FormControl>
                                <Input placeholder="recommender@university.edu" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="relationshipType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Relationship Type *</FormLabel>
                            <FormControl>
                              <RadioGroup onValueChange={field.onChange} defaultValue={field.value}>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="professor" id="professor" />
                                  <label htmlFor="professor">Professor/Academic Instructor</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="supervisor" id="supervisor" />
                                  <label htmlFor="supervisor">Research Supervisor</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="employer" id="employer" />
                                  <label htmlFor="employer">Employer/Manager</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="mentor" id="mentor" />
                                  <label htmlFor="mentor">Mentor</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="other" id="other" />
                                  <label htmlFor="other">Other</label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="relationshipDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration of Relationship *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 2 years, 1 semester, 6 months" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="coursesProjects"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Courses/Projects Worked Together *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="List specific courses, projects, or work assignments you've done together"
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="keyStrengths"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Key Strengths to Highlight *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="What strengths should the recommender emphasize? (e.g., analytical thinking, leadership, creativity)"
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="specificExamples"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Specific Examples & Achievements *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Provide specific examples of leadership, problem-solving, or academic excellence that the recommender witnessed"
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="gradesPerformance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Grades & Performance Highlights</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Any specific grades, rankings, or performance metrics related to this recommender"
                                className="min-h-[80px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="cv" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Curriculum Vitae Information</CardTitle>
                      <CardDescription>Details for your professional Europass-style CV</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="educationHistory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Educational Background *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="List your degrees, universities, GPAs, and duration (e.g., Bachelor of Engineering, ABC University, GPA: 3.8/4.0, 2020-2024)"
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="workExperienceCV"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Work Experience & Internships</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="List your work experience with role, company, dates, and key responsibilities"
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="technicalSkills"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Technical Skills *</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Programming languages, software, tools (e.g., Python, MATLAB, AutoCAD, MS Office)"
                                  className="min-h-[100px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="softSkills"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Soft Skills *</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Communication, leadership, teamwork, problem-solving, etc."
                                  className="min-h-[100px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="languages"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Languages *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="List languages with proficiency levels (e.g., English - Fluent, German - B2, Spanish - Beginner)"
                                className="min-h-[80px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="certifications"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Certifications & Awards</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Professional certifications, academic awards, scholarships, honors"
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="extracurriculars"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Extracurricular Activities</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Clubs, sports, volunteering, hobbies, leadership positions"
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex justify-between pt-6">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    const tabs = ["sop", "lor", "cv"];
                    const currentIndex = tabs.indexOf(activeTab);
                    if (currentIndex > 0) {
                      setActiveTab(tabs[currentIndex - 1]);
                    }
                  }}
                  disabled={activeTab === "sop"}
                >
                  Previous Section
                </Button>
                
                {activeTab === "cv" ? (
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    Submit Questionnaire
                  </Button>
                ) : (
                  <Button 
                    type="button"
                    onClick={() => {
                      const tabs = ["sop", "lor", "cv"];
                      const currentIndex = tabs.indexOf(activeTab);
                      if (currentIndex < tabs.length - 1) {
                        setActiveTab(tabs[currentIndex + 1]);
                      }
                    }}
                  >
                    Next Section
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}