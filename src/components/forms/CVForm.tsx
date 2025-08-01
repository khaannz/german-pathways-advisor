import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthContext";
import { CalendarIcon, Plus, X, RotateCcw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const educationEntrySchema = z.object({
  institution: z.string().min(2, "Institution name is required"),
  program: z.string().min(2, "Program name is required"),
  start_date: z.date({ message: "Start date is required" }),
  end_date: z.date().optional(),
});

const workExperienceEntrySchema = z.object({
  company: z.string().min(2, "Company name is required"),
  position: z.string().min(2, "Position is required"),
  start_date: z.date({ message: "Start date is required" }),
  end_date: z.date().optional(),
  description: z.string().min(10, "Please provide at least 10 characters"),
});

const cvSchema = z.object({
  education_entries: z.array(educationEntrySchema).min(1, "At least one education entry is required"),
  work_experience_entries: z.array(workExperienceEntrySchema).min(1, "At least one work experience entry is required"),
  technical_skills: z.string().min(15, "Please provide at least 15 characters"),
  soft_skills: z.string().min(15, "Please provide at least 15 characters"),
  languages: z.string().min(15, "Please provide at least 15 characters"),
  certifications: z.string().min(15, "Please provide at least 15 characters"),
  extracurriculars: z.string().min(15, "Please provide at least 15 characters"),
});

type CVFormData = z.infer<typeof cvSchema>;

interface EducationEntry {
  id?: string;
  institution: string;
  program: string;
  start_date: Date;
  end_date?: Date;
}

interface WorkExperienceEntry {
  id?: string;
  company: string;
  position: string;
  start_date: Date;
  end_date?: Date;
  description: string;
}

interface CVResponse {
  id?: string;
  photo_url?: string;
  technical_skills: string;
  soft_skills: string;
  languages: string;
  certifications: string;
  extracurriculars: string;
}

export function CVForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [existingResponse, setExistingResponse] = useState<CVResponse | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<CVFormData>({
    resolver: zodResolver(cvSchema),
    defaultValues: {
      education_entries: [{ institution: "", program: "", start_date: new Date(), end_date: undefined }],
      work_experience_entries: [{ company: "", position: "", start_date: new Date(), end_date: undefined, description: "" }],
      technical_skills: "",
      soft_skills: "",
      languages: "",
      certifications: "",
      extracurriculars: "",
    },
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control: form.control,
    name: "education_entries",
  });

  const { fields: workExperienceFields, append: appendWorkExperience, remove: removeWorkExperience } = useFieldArray({
    control: form.control,
    name: "work_experience_entries",
  });

  useEffect(() => {
    if (user) {
      loadExistingResponse();
    }
  }, [user]);

  const loadExistingResponse = async () => {
    try {
      const { data: cvData, error: cvError } = await supabase
        .from("cv_responses")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (cvError) throw cvError;

      if (cvData) {
        setExistingResponse(cvData);
        
        // Load education entries
        const { data: educationData, error: educationError } = await supabase
          .from("cv_education_entries")
          .select("*")
          .eq("user_id", user?.id)
          .order("start_date", { ascending: true });

        if (educationError) throw educationError;

        // Load work experience entries
        const { data: workExperienceData, error: workExperienceError } = await supabase
          .from("cv_work_experience_entries")
          .select("*")
          .eq("user_id", user?.id)
          .order("start_date", { ascending: true });

        if (workExperienceError) throw workExperienceError;

        const educationEntries = educationData?.map(entry => ({
          id: entry.id,
          institution: entry.institution,
          program: entry.program,
          start_date: new Date(entry.start_date),
          end_date: entry.end_date ? new Date(entry.end_date) : undefined,
        })) || [];

        const workExperienceEntries = workExperienceData?.map(entry => ({
          id: entry.id,
          company: entry.company,
          position: entry.position,
          start_date: new Date(entry.start_date),
          end_date: entry.end_date ? new Date(entry.end_date) : undefined,
          description: entry.description || "",
        })) || [];

        form.reset({
          education_entries: educationEntries.length > 0 ? educationEntries : [{ institution: "", program: "", start_date: new Date(), end_date: undefined }],
          work_experience_entries: workExperienceEntries.length > 0 ? workExperienceEntries : [{ company: "", position: "", start_date: new Date(), end_date: undefined, description: "" }],
          technical_skills: cvData.technical_skills || "",
          soft_skills: cvData.soft_skills || "",
          languages: cvData.languages || "",
          certifications: cvData.certifications || "",
          extracurriculars: cvData.extracurriculars || "",
        });
      }
    } catch (error) {
      console.error("Error loading CV response:", error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPEG or PNG image.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!selectedFile || !user) return null;

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('cv_photos')
        .upload(fileName, selectedFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('cv_photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: CVFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      let photoUrl = existingResponse?.photo_url;

      if (selectedFile) {
        const uploadedUrl = await uploadPhoto();
        if (uploadedUrl) {
          photoUrl = uploadedUrl;
        }
      }

      const cvData = {
        user_id: user.id,
        technical_skills: data.technical_skills,
        soft_skills: data.soft_skills,
        languages: data.languages,
        certifications: data.certifications,
        extracurriculars: data.extracurriculars,
        photo_url: photoUrl,
      };

      let cvResponseId = existingResponse?.id;

      if (existingResponse) {
        const { error } = await supabase
          .from("cv_responses")
          .update(cvData)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { data: newCvResponse, error } = await supabase
          .from("cv_responses")
          .insert(cvData)
          .select()
          .single();

        if (error) throw error;
        cvResponseId = newCvResponse.id;
      }

      // Delete existing education entries
      await supabase
        .from("cv_education_entries")
        .delete()
        .eq("user_id", user.id);

      // Delete existing work experience entries
      await supabase
        .from("cv_work_experience_entries")
        .delete()
        .eq("user_id", user.id);

      // Insert new education entries
      const educationEntries = data.education_entries.map(entry => ({
        cv_response_id: cvResponseId,
        user_id: user.id,
        institution: entry.institution,
        program: entry.program,
        start_date: entry.start_date.toISOString().split('T')[0],
        end_date: entry.end_date ? entry.end_date.toISOString().split('T')[0] : null,
      }));

      const { error: educationError } = await supabase
        .from("cv_education_entries")
        .insert(educationEntries);

      if (educationError) throw educationError;

      // Insert new work experience entries
      const workExperienceEntries = data.work_experience_entries.map(entry => ({
        cv_response_id: cvResponseId,
        user_id: user.id,
        company: entry.company,
        position: entry.position,
        start_date: entry.start_date.toISOString().split('T')[0],
        end_date: entry.end_date ? entry.end_date.toISOString().split('T')[0] : null,
        description: entry.description,
      }));

      const { error: workExperienceError } = await supabase
        .from("cv_work_experience_entries")
        .insert(workExperienceEntries);

      if (workExperienceError) throw workExperienceError;

      toast({
        title: "Success",
        description: "CV information saved successfully!",
        duration: 5000,
      });

      setSelectedFile(null);
      loadExistingResponse();
    } catch (error) {
      console.error("Error saving CV:", error);
      toast({
        title: "Error",
        description: "Failed to save CV information. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    form.reset({
      education_entries: [{ institution: "", program: "", start_date: new Date(), end_date: undefined }],
      work_experience_entries: [{ company: "", position: "", start_date: new Date(), end_date: undefined, description: "" }],
      technical_skills: "",
      soft_skills: "",
      languages: "",
      certifications: "",
      extracurriculars: "",
    });
    setSelectedFile(null);
    toast({
      title: "Form cleared",
      description: "All form fields have been reset to default values.",
      duration: 3000,
    });
  };

  const handleDeleteForm = async () => {
    if (!user || !existingResponse) return;

    setLoading(true);
    try {
      // Delete education entries first
      await supabase
        .from("cv_education_entries")
        .delete()
        .eq("user_id", user.id);

      // Delete work experience entries
      await supabase
        .from("cv_work_experience_entries")
        .delete()
        .eq("user_id", user.id);

      // Delete CV response
      const { error } = await supabase
        .from("cv_responses")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "CV form deleted successfully!",
        duration: 5000,
      });

      setExistingResponse(null);
      handleClearForm();
    } catch (error) {
      console.error("Error deleting CV:", error);
      toast({
        title: "Error",
        description: "Failed to delete CV form. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Curriculum Vitae (CV)</CardTitle>
        <CardDescription>
          Provide your educational background, skills, and experience for your CV
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Photo Upload */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Professional Photo (Optional)
                </label>
                <Input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileSelect}
                  className="mb-2"
                />
                <p className="text-sm text-muted-foreground">
                  JPEG or PNG, maximum 5MB
                </p>
                {existingResponse?.photo_url && !selectedFile && (
                  <div className="mt-2">
                    <img
                      src={existingResponse.photo_url}
                      alt="Current photo"
                      className="w-24 h-24 object-cover rounded-md"
                    />
                    <p className="text-sm text-muted-foreground mt-1">Current photo</p>
                  </div>
                )}
                {selectedFile && (
                  <p className="text-sm text-green-600 mt-2">
                    New photo selected: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>

            {/* Dynamic Education History */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel className="text-base font-medium">Education History</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendEducation({ institution: "", program: "", start_date: new Date(), end_date: undefined })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
              </div>
              
              {educationFields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Education Entry {index + 1}</h4>
                    {educationFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEducation(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <FormField
                      control={form.control}
                      name={`education_entries.${index}.institution`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Institution</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., University of Example"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`education_entries.${index}.program`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Program/Degree</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Bachelor of Computer Science"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`education_entries.${index}.start_date`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date()}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`education_entries.${index}.end_date`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date (Optional)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date (or leave blank if ongoing)</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date()}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>
              ))}
            </div>

            {/* Dynamic Work Experience */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel className="text-base font-medium">Work Experience</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendWorkExperience({ company: "", position: "", start_date: new Date(), end_date: undefined, description: "" })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Work Experience
                </Button>
              </div>
              
              {workExperienceFields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Work Experience Entry {index + 1}</h4>
                    {workExperienceFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeWorkExperience(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <FormField
                      control={form.control}
                      name={`work_experience_entries.${index}.company`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company/Organization</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Tech Solutions Inc."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`work_experience_entries.${index}.position`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position/Role</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Software Developer Intern"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <FormField
                      control={form.control}
                      name={`work_experience_entries.${index}.start_date`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date()}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`work_experience_entries.${index}.end_date`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date (Optional)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date (or leave blank if ongoing)</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date()}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name={`work_experience_entries.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your responsibilities and achievements..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>
              ))}
            </div>

            {/* Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="technical_skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technical Skills</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List your technical skills, programming languages, software, etc..."
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
                name="soft_skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soft Skills</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List your soft skills like communication, leadership, teamwork..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Languages and Certifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="languages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Languages</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List languages you speak and your proficiency level..."
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
                name="certifications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certifications</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List your professional certifications, courses, licenses..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Extracurriculars */}
            <FormField
              control={form.control}
              name="extracurriculars"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Extracurricular Activities</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your extracurricular activities, volunteer work, hobbies, achievements..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button type="submit" disabled={loading || uploading}>
                {loading || uploading ? "Saving..." : existingResponse ? "Update CV" : "Save CV"}
              </Button>
              
              <Button type="button" variant="outline" onClick={handleClearForm}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear Form
              </Button>
              
              {existingResponse && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Form
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your CV form data and all education entries.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteForm} disabled={loading}>
                        {loading ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}