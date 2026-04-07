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
      activities: {
        Row: {
          created_at: string
          description: string
          id: string
          title: string
          type: Database["public"]["Enums"]["activity_type"]
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          title: string
          type: Database["public"]["Enums"]["activity_type"]
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          title?: string
          type?: Database["public"]["Enums"]["activity_type"]
          user_id?: string | null
        }
        Relationships: []
      }
      developers: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      lead_folders: {
        Row: {
          created_at: string
          id: string
          location: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string
          name?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_to: string | null
          company: string | null
          created_at: string
          email: string
          folder_id: string | null
          follow_up_date: string | null
          id: string
          name: string
          phone: string
          social_media: Json | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          email?: string
          folder_id?: string | null
          follow_up_date?: string | null
          id?: string
          name: string
          phone?: string
          social_media?: Json | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          email?: string
          folder_id?: string | null
          follow_up_date?: string | null
          id?: string
          name?: string
          phone?: string
          social_media?: Json | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "lead_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          lead_id: string | null
          project_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string
          id?: string
          lead_id?: string | null
          project_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          lead_id?: string | null
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      project_requests: {
        Row: {
          client_email: string
          client_name: string
          client_phone: string
          created_at: string
          description: string
          id: string
          lead_id: string
          lead_name: string
          project_name: string
          rejection_reason: string | null
          requested_by: string
          status: Database["public"]["Enums"]["project_request_status"]
        }
        Insert: {
          client_email?: string
          client_name?: string
          client_phone?: string
          created_at?: string
          description?: string
          id?: string
          lead_id: string
          lead_name?: string
          project_name: string
          rejection_reason?: string | null
          requested_by?: string
          status?: Database["public"]["Enums"]["project_request_status"]
        }
        Update: {
          client_email?: string
          client_name?: string
          client_phone?: string
          created_at?: string
          description?: string
          id?: string
          lead_id?: string
          lead_name?: string
          project_name?: string
          rejection_reason?: string | null
          requested_by?: string
          status?: Database["public"]["Enums"]["project_request_status"]
        }
        Relationships: []
      }
      projects: {
        Row: {
          assigned_developer: string | null
          assigned_to: string
          client_email: string
          client_name: string
          client_phone: string
          created_at: string
          deadline: string | null
          id: string
          lead_id: string | null
          name: string
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
        }
        Insert: {
          assigned_developer?: string | null
          assigned_to?: string
          client_email?: string
          client_name?: string
          client_phone?: string
          created_at?: string
          deadline?: string | null
          id?: string
          lead_id?: string | null
          name: string
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
        }
        Update: {
          assigned_developer?: string | null
          assigned_to?: string
          client_email?: string
          client_name?: string
          client_phone?: string
          created_at?: string
          deadline?: string | null
          id?: string
          lead_id?: string | null
          name?: string
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          address: string | null
          avatar: string | null
          created_at: string
          dob: string | null
          email: string
          id: string
          joining_date: string | null
          name: string
          password: string | null
          phone: string | null
          profile_pic: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          username: string | null
        }
        Insert: {
          address?: string | null
          avatar?: string | null
          created_at?: string
          dob?: string | null
          email: string
          id?: string
          joining_date?: string | null
          name: string
          password?: string | null
          phone?: string | null
          profile_pic?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username?: string | null
        }
        Update: {
          address?: string | null
          avatar?: string | null
          created_at?: string
          dob?: string | null
          email?: string
          id?: string
          joining_date?: string | null
          name?: string
          password?: string | null
          phone?: string | null
          profile_pic?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_type:
        | "lead_added"
        | "lead_updated"
        | "lead_deleted"
        | "lead_status_changed"
        | "lead_assigned"
        | "lead_note_added"
        | "project_added"
        | "project_deleted"
        | "project_status_changed"
        | "project_renamed"
        | "project_deadline_set"
        | "developer_assigned"
        | "developer_added"
        | "developer_removed"
        | "user_added"
        | "user_removed"
        | "folder_added"
        | "folder_deleted"
        | "project_request_created"
        | "project_request_approved"
        | "project_request_rejected"
      lead_status:
        | "New"
        | "Contacted"
        | "Follow-up"
        | "Interested"
        | "Not Interested"
        | "Converted"
      notification_type: "follow_up" | "assignment" | "conversion" | "info"
      project_request_status: "pending" | "approved" | "rejected"
      project_status:
        | "Planning"
        | "In Progress"
        | "Review"
        | "Completed"
        | "On Hold"
      user_role: "admin" | "tech_lead" | "sales_manager" | "telecaller"
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
      activity_type: [
        "lead_added",
        "lead_updated",
        "lead_deleted",
        "lead_status_changed",
        "lead_assigned",
        "lead_note_added",
        "project_added",
        "project_deleted",
        "project_status_changed",
        "project_renamed",
        "project_deadline_set",
        "developer_assigned",
        "developer_added",
        "developer_removed",
        "user_added",
        "user_removed",
        "folder_added",
        "folder_deleted",
        "project_request_created",
        "project_request_approved",
        "project_request_rejected",
      ],
      lead_status: [
        "New",
        "Contacted",
        "Follow-up",
        "Interested",
        "Not Interested",
        "Converted",
      ],
      notification_type: ["follow_up", "assignment", "conversion", "info"],
      project_request_status: ["pending", "approved", "rejected"],
      project_status: [
        "Planning",
        "In Progress",
        "Review",
        "Completed",
        "On Hold",
      ],
      user_role: ["admin", "tech_lead", "sales_manager", "telecaller"],
    },
  },
} as const
