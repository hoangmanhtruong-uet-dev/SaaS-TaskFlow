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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      activity_events: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          id: string
          metadata: Json
          target_id: string
          target_type: string
          workspace_id: string
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          target_id: string
          target_type: string
          workspace_id: string
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          target_id?: string
          target_type?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_events_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      board_columns: {
        Row: {
          board_id: string
          created_at: string
          id: string
          name: string
          position: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          board_id: string
          created_at?: string
          id?: string
          name: string
          position: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          board_id?: string
          created_at?: string
          id?: string
          name?: string
          position?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_columns_workspace_id_board_id_fkey"
            columns: ["workspace_id", "board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      boards: {
        Row: {
          created_at: string
          id: string
          name: string
          project_id: string
          updated_at: string
          version: number
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          project_id: string
          updated_at?: string
          version?: number
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          project_id?: string
          updated_at?: string
          version?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "boards_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      comments: {
        Row: {
          author_membership_id: string
          body: string
          created_at: string
          deleted_at: string | null
          hidden_by_admin_at: string | null
          id: string
          task_id: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          author_membership_id: string
          body: string
          created_at?: string
          deleted_at?: string | null
          hidden_by_admin_at?: string | null
          id?: string
          task_id: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          author_membership_id?: string
          body?: string
          created_at?: string
          deleted_at?: string | null
          hidden_by_admin_at?: string | null
          id?: string
          task_id?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_workspace_id_author_membership_id_fkey"
            columns: ["workspace_id", "author_membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "comments_workspace_id_task_id_fkey"
            columns: ["workspace_id", "task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          created_by_user_id: string
          email_normalized: string
          expires_at: string
          id: string
          role: Database["public"]["Enums"]["workspace_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          token_hash: string
          workspace_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          created_by_user_id: string
          email_normalized: string
          expires_at: string
          id?: string
          role: Database["public"]["Enums"]["workspace_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token_hash: string
          workspace_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          created_by_user_id?: string
          email_normalized?: string
          expires_at?: string
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token_hash?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["workspace_role"]
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["workspace_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          email_normalized: string | null
          id: string
          name: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          email_normalized?: string | null
          id: string
          name?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          email_normalized?: string | null
          id?: string
          name?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_members: {
        Row: {
          access_level: Database["public"]["Enums"]["project_access_level"]
          membership_id: string
          project_id: string
          workspace_id: string
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["project_access_level"]
          membership_id: string
          project_id: string
          workspace_id: string
        }
        Update: {
          access_level?: Database["public"]["Enums"]["project_access_level"]
          membership_id?: string
          project_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_workspace_id_membership_id_fkey"
            columns: ["workspace_id", "membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "project_members_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      projects: {
        Row: {
          archived_at: string | null
          created_at: string
          description: string
          id: string
          lead_membership_id: string | null
          name: string
          updated_at: string
          visibility: Database["public"]["Enums"]["project_visibility"]
          workspace_id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          description?: string
          id?: string
          lead_membership_id?: string | null
          name: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["project_visibility"]
          workspace_id: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          description?: string
          id?: string
          lead_membership_id?: string | null
          name?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["project_visibility"]
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_workspace_id_lead_membership_id_fkey"
            columns: ["workspace_id", "lead_membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      stripe_events: {
        Row: {
          id: string
          processed_at: string
          type: string
        }
        Insert: {
          id: string
          processed_at?: string
          type: string
        }
        Update: {
          id?: string
          processed_at?: string
          type?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          id: string
          last_invoice_status: string | null
          provider_updated_at: string
          quantity: number
          status: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_product_id: string | null
          stripe_subscription_id: string | null
          stripe_subscription_item_id: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          id?: string
          last_invoice_status?: string | null
          provider_updated_at?: string
          quantity?: number
          status: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          stripe_subscription_id?: string | null
          stripe_subscription_item_id?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          id?: string
          last_invoice_status?: string | null
          provider_updated_at?: string
          quantity?: number
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          stripe_subscription_id?: string | null
          stripe_subscription_item_id?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          archived_at: string | null
          board_id: string
          column_id: string
          created_at: string
          creator_membership_id: string
          description: string
          due_at: string | null
          id: string
          position: number
          priority: string
          project_id: string
          title: string
          updated_at: string
          version: number
          workspace_id: string
        }
        Insert: {
          archived_at?: string | null
          board_id: string
          column_id: string
          created_at?: string
          creator_membership_id: string
          description?: string
          due_at?: string | null
          id?: string
          position: number
          priority?: string
          project_id: string
          title: string
          updated_at?: string
          version?: number
          workspace_id: string
        }
        Update: {
          archived_at?: string | null
          board_id?: string
          column_id?: string
          created_at?: string
          creator_membership_id?: string
          description?: string
          due_at?: string | null
          id?: string
          position?: number
          priority?: string
          project_id?: string
          title?: string
          updated_at?: string
          version?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_workspace_id_board_id_fkey"
            columns: ["workspace_id", "board_id"]
            isOneToOne: false
            referencedRelation: "boards"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "tasks_workspace_id_column_id_fkey"
            columns: ["workspace_id", "column_id"]
            isOneToOne: false
            referencedRelation: "board_columns"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "tasks_workspace_id_creator_membership_id_fkey"
            columns: ["workspace_id", "creator_membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["workspace_id", "id"]
          },
          {
            foreignKeyName: "tasks_workspace_id_project_id_fkey"
            columns: ["workspace_id", "project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["workspace_id", "id"]
          },
        ]
      }
      workspaces: {
        Row: {
          archived_at: string | null
          created_at: string
          deletion_requested_at: string | null
          deletion_scheduled_for: string | null
          id: string
          name: string
          plan: string
          slug: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          deletion_requested_at?: string | null
          deletion_scheduled_for?: string | null
          id?: string
          name: string
          plan?: string
          slug: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          deletion_requested_at?: string | null
          deletion_scheduled_for?: string | null
          id?: string
          name?: string
          plan?: string
          slug?: string
          updated_at?: string
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
      invitation_status:
        | "PENDING"
        | "ACCEPTED"
        | "DECLINED"
        | "EXPIRED"
        | "USED"
        | "REVOKED"
      membership_status: "ACTIVE" | "SUSPENDED" | "LEFT"
      project_access_level: "VIEW" | "COMMENT" | "EDIT"
      project_visibility: "WORKSPACE" | "PRIVATE"
      workspace_role: "OWNER" | "ADMIN" | "MEMBER" | "GUEST"
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
      invitation_status: [
        "PENDING",
        "ACCEPTED",
        "DECLINED",
        "EXPIRED",
        "USED",
        "REVOKED",
      ],
      membership_status: ["ACTIVE", "SUSPENDED", "LEFT"],
      project_access_level: ["VIEW", "COMMENT", "EDIT"],
      project_visibility: ["WORKSPACE", "PRIVATE"],
      workspace_role: ["OWNER", "ADMIN", "MEMBER", "GUEST"],
    },
  },
} as const
