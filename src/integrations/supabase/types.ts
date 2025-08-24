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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      shipment_events: {
        Row: {
          created_at: string
          id: string
          lat: number | null
          lng: number | null
          location: string | null
          note: string | null
          occurred_at: string
          shipment_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          location?: string | null
          note?: string | null
          occurred_at?: string
          shipment_id: string
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          location?: string | null
          note?: string | null
          occurred_at?: string
          shipment_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_events_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          created_at: string
          currency: string
          current_status: string
          days_of_package: number | null
          destination: string
          eta: string | null
          id: string
          is_customs_held: boolean
          last_scan_at: string | null
          lat: number | null
          lng: number | null
          media_type: string | null
          media_url: string | null
          origin: string
          package_description: string
          package_value: number
          receiver_address: string
          receiver_country: string
          receiver_email: string | null
          receiver_name: string
          sender_address: string
          sender_country: string
          sender_email: string | null
          sender_name: string
          shipping_fee: number | null
          tracking_id: string
          updated_at: string
          weight: number | null
        }
        Insert: {
          created_at?: string
          currency?: string
          current_status?: string
          days_of_package?: number | null
          destination: string
          eta?: string | null
          id?: string
          is_customs_held?: boolean
          last_scan_at?: string | null
          lat?: number | null
          lng?: number | null
          media_type?: string | null
          media_url?: string | null
          origin: string
          package_description: string
          package_value: number
          receiver_address: string
          receiver_country: string
          receiver_email?: string | null
          receiver_name: string
          sender_address: string
          sender_country: string
          sender_email?: string | null
          sender_name: string
          shipping_fee?: number | null
          tracking_id: string
          updated_at?: string
          weight?: number | null
        }
        Update: {
          created_at?: string
          currency?: string
          current_status?: string
          days_of_package?: number | null
          destination?: string
          eta?: string | null
          id?: string
          is_customs_held?: boolean
          last_scan_at?: string | null
          lat?: number | null
          lng?: number | null
          media_type?: string | null
          media_url?: string | null
          origin?: string
          package_description?: string
          package_value?: number
          receiver_address?: string
          receiver_country?: string
          receiver_email?: string | null
          receiver_name?: string
          sender_address?: string
          sender_country?: string
          sender_email?: string | null
          sender_name?: string
          shipping_fee?: number | null
          tracking_id?: string
          updated_at?: string
          weight?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_shipment_by_tracking_id: {
        Args: { tracking_code: string }
        Returns: {
          created_at: string
          current_status: string
          destination: string
          eta: string
          id: string
          is_customs_held: boolean
          lat: number
          lng: number
          media_type: string
          media_url: string
          origin: string
          package_description: string
          tracking_id: string
          updated_at: string
        }[]
      }
      get_public_shipment_events_by_tracking_id: {
        Args: { tracking_code: string }
        Returns: {
          id: string
          lat: number
          lng: number
          location: string
          note: string
          occurred_at: string
          status: string
        }[]
      }
      get_shipment_by_tracking_id: {
        Args: { tracking_code: string }
        Returns: {
          created_at: string
          current_status: string
          destination: string
          eta: string
          id: string
          lat: number
          lng: number
          media_type: string
          media_url: string
          origin: string
          package_description: string
          receiver_name: string
          sender_name: string
          tracking_id: string
          updated_at: string
        }[]
      }
      get_shipment_events_by_tracking_id: {
        Args: { tracking_code: string }
        Returns: {
          id: string
          lat: number
          lng: number
          location: string
          note: string
          occurred_at: string
          status: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
