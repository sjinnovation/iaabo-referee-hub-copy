export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      boards: {
        Row: {
          board_number: number
          created_at: string
          id: string
          name: string
          region_id: string | null
          secretary_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          board_number: number
          created_at?: string
          id?: string
          name: string
          region_id?: string | null
          secretary_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          board_number?: number
          created_at?: string
          id?: string
          name?: string
          region_id?: string | null
          secretary_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "boards_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boards_secretary_id_fkey"
            columns: ["secretary_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      certificate_template: {
        Row: {
          course_title_font_size_px: number
          course_title_x_percent: number
          course_title_y_percent: number
          font_size_px: number
          id: string
          member_name_x_percent: number
          member_name_y_percent: number
          template_url: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          course_title_font_size_px?: number
          course_title_x_percent?: number
          course_title_y_percent?: number
          font_size_px?: number
          id?: string
          member_name_x_percent?: number
          member_name_y_percent?: number
          template_url?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          course_title_font_size_px?: number
          course_title_x_percent?: number
          course_title_y_percent?: number
          font_size_px?: number
          id?: string
          member_name_x_percent?: number
          member_name_y_percent?: number
          template_url?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      course_content_blocks: {
        Row: {
          caption: string | null
          course_id: string
          created_at: string
          id: string
          media_file_name: string | null
          media_url: string | null
          section_id: string | null
          sort_order: number
          text_content: string | null
          title: string | null
          type: string
          youtube_video_id: string | null
        }
        Insert: {
          caption?: string | null
          course_id: string
          created_at?: string
          id?: string
          media_file_name?: string | null
          media_url?: string | null
          section_id?: string | null
          sort_order?: number
          text_content?: string | null
          title?: string | null
          type: string
          youtube_video_id?: string | null
        }
        Update: {
          caption?: string | null
          course_id?: string
          created_at?: string
          id?: string
          media_file_name?: string | null
          media_url?: string | null
          section_id?: string | null
          sort_order?: number
          text_content?: string | null
          title?: string | null
          type?: string
          youtube_video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_content_blocks_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_content_blocks_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "course_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollment_block_completions: {
        Row: {
          block_id: string
          completed_at: string
          enrollment_id: string
          id: string
        }
        Insert: {
          block_id: string
          completed_at?: string
          enrollment_id: string
          id?: string
        }
        Update: {
          block_id?: string
          completed_at?: string
          enrollment_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollment_block_completions_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "course_content_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollment_block_completions_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "course_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string
          enrolled_by: string | null
          id: string
          member_id: string
          progress: number
          status: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string
          enrolled_by?: string | null
          id?: string
          member_id: string
          progress?: number
          status?: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string
          enrolled_by?: string | null
          id?: string
          member_id?: string
          progress?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_quiz_attempts: {
        Row: {
          content_block_id: string
          enrollment_id: string
          id: string
          passed: boolean
          score: number
          submitted_at: string
          total_questions: number
        }
        Insert: {
          content_block_id: string
          enrollment_id: string
          id?: string
          passed: boolean
          score: number
          submitted_at?: string
          total_questions: number
        }
        Update: {
          content_block_id?: string
          enrollment_id?: string
          id?: string
          passed?: boolean
          score?: number
          submitted_at?: string
          total_questions?: number
        }
        Relationships: [
          {
            foreignKeyName: "course_quiz_attempts_content_block_id_fkey"
            columns: ["content_block_id"]
            isOneToOne: false
            referencedRelation: "course_content_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_quiz_attempts_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "course_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      course_quiz_blocks: {
        Row: {
          content_block_id: string
          created_at: string
          id: string
          passing_score: number
        }
        Insert: {
          content_block_id: string
          created_at?: string
          id?: string
          passing_score: number
        }
        Update: {
          content_block_id?: string
          created_at?: string
          id?: string
          passing_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "course_quiz_blocks_content_block_id_fkey"
            columns: ["content_block_id"]
            isOneToOne: true
            referencedRelation: "course_content_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      course_quiz_questions: {
        Row: {
          correct_index: number
          created_at: string
          id: string
          options: Json
          question_text: string
          quiz_block_id: string
          sort_order: number
        }
        Insert: {
          correct_index: number
          created_at?: string
          id?: string
          options?: Json
          question_text: string
          quiz_block_id: string
          sort_order?: number
        }
        Update: {
          correct_index?: number
          created_at?: string
          id?: string
          options?: Json
          question_text?: string
          quiz_block_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "course_quiz_questions_quiz_block_id_fkey"
            columns: ["quiz_block_id"]
            isOneToOne: false
            referencedRelation: "course_quiz_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      course_sections: {
        Row: {
          course_id: string
          created_at: string
          id: string
          sort_order: number
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          sort_order?: number
          title?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_sections_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          currency: string
          description: string
          estimated_duration_minutes: number
          id: string
          is_free: boolean
          is_required: boolean
          learndash_course_id: number | null
          price: number
          season_year: string
          status: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string
          estimated_duration_minutes?: number
          id?: string
          is_free?: boolean
          is_required?: boolean
          learndash_course_id?: number | null
          price?: number
          season_year: string
          status?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string
          estimated_duration_minutes?: number
          id?: string
          is_free?: boolean
          is_required?: boolean
          learndash_course_id?: number | null
          price?: number
          season_year?: string
          status?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      embedded_course_enrollments: {
        Row: {
          completed_at: string | null
          embedded_course_id: string
          enrolled_at: string
          id: string
          member_id: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          embedded_course_id: string
          enrolled_at?: string
          id?: string
          member_id: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          embedded_course_id?: string
          enrolled_at?: string
          id?: string
          member_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "embedded_course_enrollments_embedded_course_id_fkey"
            columns: ["embedded_course_id"]
            isOneToOne: false
            referencedRelation: "embedded_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      embedded_course_quiz_questions: {
        Row: {
          correct_index: number
          created_at: string
          embedded_course_id: string
          id: string
          options: Json
          question_text: string
          quiz_identifier: string | null
          sort_order: number
        }
        Insert: {
          correct_index: number
          created_at?: string
          embedded_course_id: string
          id?: string
          options?: Json
          question_text: string
          quiz_identifier?: string | null
          sort_order?: number
        }
        Update: {
          correct_index?: number
          created_at?: string
          embedded_course_id?: string
          id?: string
          options?: Json
          question_text?: string
          quiz_identifier?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "embedded_course_quiz_questions_embedded_course_id_fkey"
            columns: ["embedded_course_id"]
            isOneToOne: false
            referencedRelation: "embedded_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      embedded_course_quiz_results: {
        Row: {
          completed_at: string
          embedded_course_enrollment_id: string | null
          embedded_course_id: string | null
          enrollment_id: string | null
          id: string
          max_score: number | null
          member_id: string | null
          passed: boolean
          quiz_identifier: string | null
          score: number | null
          slide_title: string | null
          submitted_at: string
        }
        Insert: {
          completed_at?: string
          embedded_course_enrollment_id?: string | null
          embedded_course_id?: string | null
          enrollment_id?: string | null
          id?: string
          max_score?: number | null
          member_id?: string | null
          passed?: boolean
          quiz_identifier?: string | null
          score?: number | null
          slide_title?: string | null
          submitted_at?: string
        }
        Update: {
          completed_at?: string
          embedded_course_enrollment_id?: string | null
          embedded_course_id?: string | null
          enrollment_id?: string | null
          id?: string
          max_score?: number | null
          member_id?: string | null
          passed?: boolean
          quiz_identifier?: string | null
          score?: number | null
          slide_title?: string | null
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "embedded_course_quiz_results_embedded_course_enrollment_id_fkey"
            columns: ["embedded_course_enrollment_id"]
            isOneToOne: false
            referencedRelation: "embedded_course_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "embedded_course_quiz_results_embedded_course_id_fkey"
            columns: ["embedded_course_id"]
            isOneToOne: false
            referencedRelation: "embedded_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "embedded_course_quiz_results_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "embedded_course_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      embedded_courses: {
        Row: {
          certificate_course_title_font_size_px: number | null
          certificate_course_title_x_percent: number | null
          certificate_course_title_y_percent: number | null
          certificate_member_name_font_size_px: number | null
          certificate_member_name_x_percent: number | null
          certificate_member_name_y_percent: number | null
          certificate_template_url: string | null
          content_in_storage: boolean
          created_at: string
          created_by: string | null
          description: string | null
          folder_slug: string
          iaabo_course_id: string | null
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          certificate_course_title_font_size_px?: number | null
          certificate_course_title_x_percent?: number | null
          certificate_course_title_y_percent?: number | null
          certificate_member_name_font_size_px?: number | null
          certificate_member_name_x_percent?: number | null
          certificate_member_name_y_percent?: number | null
          certificate_template_url?: string | null
          content_in_storage?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          folder_slug: string
          iaabo_course_id?: string | null
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          certificate_course_title_font_size_px?: number | null
          certificate_course_title_x_percent?: number | null
          certificate_course_title_y_percent?: number | null
          certificate_member_name_font_size_px?: number | null
          certificate_member_name_x_percent?: number | null
          certificate_member_name_y_percent?: number | null
          certificate_template_url?: string | null
          content_in_storage?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          folder_slug?: string
          iaabo_course_id?: string | null
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      member_progression: {
        Row: {
          completed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          metadata: Json | null
          notes: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["progression_status"]
          step_type: Database["public"]["Enums"]["progression_step_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["progression_status"]
          step_type: Database["public"]["Enums"]["progression_step_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["progression_status"]
          step_type?: Database["public"]["Enums"]["progression_step_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          board_id: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          first_name: string
          iaabo_id: string | null
          id: string
          is_active: boolean
          is_over_18: boolean
          last_name: string
          last_sign_in_at: string | null
          phone: string
          state: string | null
          street_address: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          board_id?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          first_name?: string
          iaabo_id?: string | null
          id: string
          is_active?: boolean
          is_over_18?: boolean
          last_name?: string
          last_sign_in_at?: string | null
          phone?: string
          state?: string | null
          street_address?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          board_id?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          first_name?: string
          iaabo_id?: string | null
          id?: string
          is_active?: boolean
          is_over_18?: boolean
          last_name?: string
          last_sign_in_at?: string | null
          phone?: string
          state?: string | null
          street_address?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          created_at: string
          full_name: string
          id: string
          short_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          short_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          short_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_member_progression_summary: {
        Args: { p_user_id: string }
        Returns: {
          completed_at: string
          notes: string
          started_at: string
          status: Database["public"]["Enums"]["progression_status"]
          step_type: Database["public"]["Enums"]["progression_step_type"]
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      initialize_member_progression: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      update_progression_step: {
        Args: {
          p_metadata?: Json
          p_notes?: string
          p_status: Database["public"]["Enums"]["progression_status"]
          p_step_type: Database["public"]["Enums"]["progression_step_type"]
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "public_user"
        | "member"
        | "secretary"
        | "area_rep"
        | "admin"
        | "super_admin"
      progression_status:
        | "not_started"
        | "in_progress"
        | "completed"
        | "failed"
        | "waived"
      progression_step_type:
        | "registration"
        | "rules_test"
        | "board_assignment"
        | "mechanics_course"
        | "payment"
        | "active_member"
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
      app_role: [
        "public_user",
        "member",
        "secretary",
        "area_rep",
        "admin",
        "super_admin",
      ],
      progression_status: [
        "not_started",
        "in_progress",
        "completed",
        "failed",
        "waived",
      ],
      progression_step_type: [
        "registration",
        "rules_test",
        "board_assignment",
        "mechanics_course",
        "payment",
        "active_member",
      ],
    },
  },
} as const
