export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      cv_education_entries: {
        Row: {
          created_at: string
          cv_response_id: string
          end_date: string | null
          id: string
          institution: string
          program: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          cv_response_id: string
          end_date?: string | null
          id?: string
          institution: string
          program: string
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          cv_response_id?: string
          end_date?: string | null
          id?: string
          institution?: string
          program?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cv_education_entries_cv_response_id_fkey"
            columns: ["cv_response_id"]
            isOneToOne: false
            referencedRelation: "cv_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      cv_responses: {
        Row: {
          certifications: string | null
          created_at: string
          education_history: string | null
          extracurriculars: string | null
          id: string
          languages: string | null
          photo_url: string | null
          soft_skills: string | null
          technical_skills: string | null
          updated_at: string
          user_id: string
          work_experience: string | null
        }
        Insert: {
          certifications?: string | null
          created_at?: string
          education_history?: string | null
          extracurriculars?: string | null
          id?: string
          languages?: string | null
          photo_url?: string | null
          soft_skills?: string | null
          technical_skills?: string | null
          updated_at?: string
          user_id: string
          work_experience?: string | null
        }
        Update: {
          certifications?: string | null
          created_at?: string
          education_history?: string | null
          extracurriculars?: string | null
          id?: string
          languages?: string | null
          photo_url?: string | null
          soft_skills?: string | null
          technical_skills?: string | null
          updated_at?: string
          user_id?: string
          work_experience?: string | null
        }
        Relationships: []
      }
      cv_work_experience_entries: {
        Row: {
          company: string
          created_at: string
          cv_response_id: string
          description: string | null
          end_date: string | null
          id: string
          position: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company: string
          created_at?: string
          cv_response_id: string
          description?: string | null
          end_date?: string | null
          id?: string
          position: string
          start_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string
          cv_response_id?: string
          description?: string | null
          end_date?: string | null
          id?: string
          position?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          drive_link: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          mime_type: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          drive_link?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          mime_type?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          drive_link?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          mime_type?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      enquiries: {
        Row: {
          created_at: string
          id: string
          message: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lor_responses: {
        Row: {
          courses_projects: string | null
          created_at: string
          grades_performance: string | null
          id: string
          key_strengths: string | null
          recommender_designation: string | null
          recommender_email: string | null
          recommender_institution: string | null
          recommender_name: string | null
          relationship_duration: string | null
          relationship_type: string | null
          specific_examples: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          courses_projects?: string | null
          created_at?: string
          grades_performance?: string | null
          id?: string
          key_strengths?: string | null
          recommender_designation?: string | null
          recommender_email?: string | null
          recommender_institution?: string | null
          recommender_name?: string | null
          relationship_duration?: string | null
          relationship_type?: string | null
          specific_examples?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          courses_projects?: string | null
          created_at?: string
          grades_performance?: string | null
          id?: string
          key_strengths?: string | null
          recommender_designation?: string | null
          recommender_email?: string | null
          recommender_institution?: string | null
          recommender_name?: string | null
          relationship_duration?: string | null
          relationship_type?: string | null
          specific_examples?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lors: {
        Row: {
          created_at: string
          google_docs_link: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          google_docs_link: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          google_docs_link?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          consultation_status: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          role: string
          target_program: string | null
          target_university: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          consultation_status?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          target_program?: string | null
          target_university?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          consultation_status?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          target_program?: string | null
          target_university?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shortlisted_universities: {
        Row: {
          application_status: Database["public"]["Enums"]["application_status"]
          created_at: string
          id: string
          program_name: string
          university_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          application_status?: Database["public"]["Enums"]["application_status"]
          created_at?: string
          id?: string
          program_name: string
          university_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          application_status?: Database["public"]["Enums"]["application_status"]
          created_at?: string
          id?: string
          program_name?: string
          university_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sop_responses: {
        Row: {
          academic_projects: string | null
          challenges_accomplishments: string | null
          created_at: string
          current_education_status: string | null
          date_of_birth: string | null
          email: string | null
          full_name: string | null
          has_thesis: boolean | null
          id: string
          intended_program: string | null
          linked_in: string | null
          long_term_goals: string | null
          nationality: string | null
          personal_qualities: string | null
          phone: string | null
          short_term_goals: string | null
          target_universities: string | null
          thesis_details: string | null
          updated_at: string
          user_id: string
          why_germany: string | null
          why_this_program: string | null
          work_experience: string | null
        }
        Insert: {
          academic_projects?: string | null
          challenges_accomplishments?: string | null
          created_at?: string
          current_education_status?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          has_thesis?: boolean | null
          id?: string
          intended_program?: string | null
          linked_in?: string | null
          long_term_goals?: string | null
          nationality?: string | null
          personal_qualities?: string | null
          phone?: string | null
          short_term_goals?: string | null
          target_universities?: string | null
          thesis_details?: string | null
          updated_at?: string
          user_id: string
          why_germany?: string | null
          why_this_program?: string | null
          work_experience?: string | null
        }
        Update: {
          academic_projects?: string | null
          challenges_accomplishments?: string | null
          created_at?: string
          current_education_status?: string | null
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          has_thesis?: boolean | null
          id?: string
          intended_program?: string | null
          linked_in?: string | null
          long_term_goals?: string | null
          nationality?: string | null
          personal_qualities?: string | null
          phone?: string | null
          short_term_goals?: string | null
          target_universities?: string | null
          thesis_details?: string | null
          updated_at?: string
          user_id?: string
          why_germany?: string | null
          why_this_program?: string | null
          work_experience?: string | null
        }
        Relationships: []
      }
      sops: {
        Row: {
          created_at: string
          google_docs_link: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          google_docs_link: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          google_docs_link?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_employee: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      application_status: "not_applied" | "in_progress" | "applied"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      application_status: ["not_applied", "in_progress", "applied"],
    },
  },
} as const
