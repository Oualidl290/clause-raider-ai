export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clauses: {
        Row: {
          category: string
          created_at: string
          document_id: string
          enforceable: boolean | null
          id: string
          loophole_summary: string | null
          risk_level: Database["public"]["Enums"]["risk_level"]
          text: string
        }
        Insert: {
          category: string
          created_at?: string
          document_id: string
          enforceable?: boolean | null
          id?: string
          loophole_summary?: string | null
          risk_level: Database["public"]["Enums"]["risk_level"]
          text: string
        }
        Update: {
          category?: string
          created_at?: string
          document_id?: string
          enforceable?: boolean | null
          id?: string
          loophole_summary?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level"]
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "clauses_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "tos_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      loophole_actions: {
        Row: {
          action_type: Database["public"]["Enums"]["action_type"]
          clause_id: string
          created_at: string
          email_template: string | null
          id: string
          legal_reference: string | null
          status: string | null
        }
        Insert: {
          action_type: Database["public"]["Enums"]["action_type"]
          clause_id: string
          created_at?: string
          email_template?: string | null
          id?: string
          legal_reference?: string | null
          status?: string | null
        }
        Update: {
          action_type?: Database["public"]["Enums"]["action_type"]
          clause_id?: string
          created_at?: string
          email_template?: string | null
          id?: string
          legal_reference?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loophole_actions_clause_id_fkey"
            columns: ["clause_id"]
            isOneToOne: false
            referencedRelation: "clauses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      tos_documents: {
        Row: {
          company_name: string
          created_at: string
          id: string
          raw_text: string
          status: Database["public"]["Enums"]["document_status"]
          url: string | null
          user_id: string
          version_hash: string
        }
        Insert: {
          company_name: string
          created_at?: string
          id?: string
          raw_text: string
          status?: Database["public"]["Enums"]["document_status"]
          url?: string | null
          user_id: string
          version_hash: string
        }
        Update: {
          company_name?: string
          created_at?: string
          id?: string
          raw_text?: string
          status?: Database["public"]["Enums"]["document_status"]
          url?: string | null
          user_id?: string
          version_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "tos_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_api_usage: {
        Row: {
          calls_today: number
          id: string
          last_call: string
          plan: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          calls_today?: number
          id?: string
          last_call?: string
          plan?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          calls_today?: number
          id?: string
          last_call?: string
          plan?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_api_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      action_type: "cancel" | "opt-out" | "refund" | "delete-data"
      document_status: "pending" | "processing" | "analyzed" | "failed"
      risk_level: "low" | "medium" | "high"
      user_role: "free" | "pro" | "elite"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      action_type: ["cancel", "opt-out", "refund", "delete-data"],
      document_status: ["pending", "processing", "analyzed", "failed"],
      risk_level: ["low", "medium", "high"],
      user_role: ["free", "pro", "elite"],
    },
  },
} as const
