import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthContext";

const cvSchema = z.object({
  education_history: z.string().min(20, "Please provide at least 20 characters"),
  work_experience: z.string().min(15, "Please provide at least 15 characters"),
  technical_skills: z.string().min(15, "Please provide at least 15 characters"),
  soft_skills: z.string().min(15, "Please provide at least 15 characters"),
  languages: z.string().min(15, "Please provide at least 15 characters"),
  certifications: z.string().min(15, "Please provide at least 15 characters"),
  extracurriculars: z.string().min(15, "Please provide at least 15 characters"),
});

type CVFormData = z.infer<typeof cvSchema>;

interface CVResponse extends CVFormData {
  photo_url?: string;
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
      education_history: "",
      work_experience: "",
      technical_skills: "",
      soft_skills: "",
      languages: "",
      certifications: "",
      extracurriculars: "",
    },
  });

  useEffect(() => {
    if (user) {
      loadExistingResponse();
    }
  }, [user]);

  const loadExistingResponse = async () => {
    try {
      const { data, error } = await supabase
        .from("cv_responses")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setExistingResponse(data);
        form.reset({
          education_history: data.education_history || "",
          work_experience: data.work_experience || "",
          technical_skills: data.technical_skills || "",
          soft_skills: data.soft_skills || "",
          languages: data.languages || "",
          certifications: data.certifications || "",
          extracurriculars: data.extracurriculars || "",
        });
      }
    } catch (error) {
      console.error("Error loading CV response:", error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPEG or PNG image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
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
        .upload(fileName, selectedFile, {
          upsert: true
        });

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

      // Upload new photo if selected
      if (selectedFile) {
        const uploadedUrl = await uploadPhoto();
        if (uploadedUrl) {
          photoUrl = uploadedUrl;
        }
      }

      const cvData = {
        user_id: user.id,
        ...data,
        photo_url: photoUrl,
      };

      if (existingResponse) {
        const { error } = await supabase
          .from("cv_responses")
          .update(cvData)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cv_responses")
          .insert(cvData);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "CV information saved successfully!",
      });

      setSelectedFile(null);
      loadExistingResponse();
    } catch (error) {
      console.error("Error saving CV:", error);
      toast({
        title: "Error",
        description: "Failed to save CV information. Please try again.",
        variant: "destructive",
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

            {/* Education */}
            <FormField
              control={form.control}
              name="education_history"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Education History</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List your educational qualifications, degrees, institutions, and graduation years..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Work Experience */}
            <FormField
              control={form.control}
              name="work_experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Experience</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your work experience, internships, and professional roles..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <Button type="submit" disabled={loading || uploading}>
              {loading || uploading ? "Saving..." : existingResponse ? "Update CV" : "Save CV"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}