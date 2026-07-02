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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      about_values: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          cta_label: string | null
          cta_url: string | null
          description: string | null
          event_date: string | null
          id: string
          image_url: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          cta_url?: string | null
          description?: string | null
          event_date?: string | null
          id?: string
          image_url: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          cta_label?: string | null
          cta_url?: string | null
          description?: string | null
          event_date?: string | null
          id?: string
          image_url?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bootcamps: {
        Row: {
          cover_image: string | null
          created_at: string
          description: string | null
          duration: string | null
          end_date: string | null
          id: string
          level: string | null
          price: string | null
          published: boolean
          seats: number | null
          slug: string
          sort_order: number
          start_date: string | null
          summary: string | null
          syllabus: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          cover_image?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          end_date?: string | null
          id?: string
          level?: string | null
          price?: string | null
          published?: boolean
          seats?: number | null
          slug: string
          sort_order?: number
          start_date?: string | null
          summary?: string | null
          syllabus?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          cover_image?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          end_date?: string | null
          id?: string
          level?: string | null
          price?: string | null
          published?: boolean
          seats?: number | null
          slug?: string
          sort_order?: number
          start_date?: string | null
          summary?: string | null
          syllabus?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          phone: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          phone?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          phone?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      corporate_clients: {
        Row: {
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          sort_order: number
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          sort_order?: number
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          sort_order?: number
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      stats: {
        Row: {
          created_at: string
          id: string
          label: string
          sort_order: number
          suffix: string
          updated_at: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          sort_order?: number
          suffix?: string
          updated_at?: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          sort_order?: number
          suffix?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      corporate_services: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_modes: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      page_content: {
        Row: {
          content: Json
          id: string
          page_key: string
          section_key: string
          updated_at: string
        }
        Insert: {
          content?: Json
          id?: string
          page_key: string
          section_key: string
          updated_at?: string
        }
        Update: {
          content?: Json
          id?: string
          page_key?: string
          section_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      programmes: {
        Row: {
          category: string | null
          cover_image: string | null
          created_at: string
          description: string | null
          duration: string | null
          featured: boolean
          id: string
          level: string | null
          outcomes: string[] | null
          price: string | null
          published: boolean
          slug: string
          sort_order: number
          summary: string | null
          syllabus: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          featured?: boolean
          id?: string
          level?: string | null
          outcomes?: string[] | null
          price?: string | null
          published?: boolean
          slug: string
          sort_order?: number
          summary?: string | null
          syllabus?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          featured?: boolean
          id?: string
          level?: string | null
          outcomes?: string[] | null
          price?: string | null
          published?: boolean
          slug?: string
          sort_order?: number
          summary?: string | null
          syllabus?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          data: Json
          id: string
          updated_at: string
        }
        Insert: {
          data?: Json
          id: string
          updated_at?: string
        }
        Update: {
          data?: Json
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      success_stories: {
        Row: {
          cohort: string | null
          company: string | null
          created_at: string
          id: string
          linkedin_url: string | null
          name: string
          photo_url: string | null
          published: boolean
          quote: string | null
          role: string | null
          sort_order: number
          story: string | null
          updated_at: string
        }
        Insert: {
          cohort?: string | null
          company?: string | null
          created_at?: string
          id?: string
          linkedin_url?: string | null
          name: string
          photo_url?: string | null
          published?: boolean
          quote?: string | null
          role?: string | null
          sort_order?: number
          story?: string | null
          updated_at?: string
        }
        Update: {
          cohort?: string | null
          company?: string | null
          created_at?: string
          id?: string
          linkedin_url?: string | null
          name?: string
          photo_url?: string | null
          published?: boolean
          quote?: string | null
          role?: string | null
          sort_order?: number
          story?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          linkedin_url: string | null
          name: string
          photo_url: string | null
          published: boolean
          role: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          linkedin_url?: string | null
          name: string
          photo_url?: string | null
          published?: boolean
          role?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          linkedin_url?: string | null
          name?: string
          photo_url?: string | null
          published?: boolean
          role?: string | null
          sort_order?: number
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
          role: Database["public"]["Enums"]["app_role"]
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
      why_choose_items: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
