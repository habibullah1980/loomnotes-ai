/**
 * Database schema definitions matching Supabase migration 20261005000000_create_initial_schema.sql
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          phone_number: string | null;
          company_name: string | null;
          marketing_consent: boolean;
          marketing_consent_at: string | null;
          role: string;
          plan: string;
          status: string;
          custom_permissions: string[];
          last_sign_in_at: string | null;
          referral_source: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone_number?: string | null;
          company_name?: string | null;
          marketing_consent?: boolean;
          marketing_consent_at?: string | null;
          role?: string;
          plan?: string;
          status?: string;
          custom_permissions?: string[];
          last_sign_in_at?: string | null;
          referral_source?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone_number?: string | null;
          company_name?: string | null;
          marketing_consent?: boolean;
          marketing_consent_at?: string | null;
          role?: string;
          plan?: string;
          status?: string;
          custom_permissions?: string[];
          last_sign_in_at?: string | null;
          referral_source?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      meetings: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          transcript: string | null;
          summary: string | null;
          loom_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          transcript?: string | null;
          summary?: string | null;
          loom_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          transcript?: string | null;
          summary?: string | null;
          loom_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "meetings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      action_items: {
        Row: {
          id: string;
          meeting_id: string;
          task: string;
          assignee: string | null;
          due_date: string | null;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          task: string;
          assignee?: string | null;
          due_date?: string | null;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          meeting_id?: string;
          task?: string;
          assignee?: string | null;
          due_date?: string | null;
          completed?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "action_items_meeting_id_fkey";
            columns: ["meeting_id"];
            isOneToOne: false;
            referencedRelation: "meetings";
            referencedColumns: ["id"];
          },
        ];
      };
      key_takeaways: {
        Row: {
          id: string;
          meeting_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          meeting_id?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "key_takeaways_meeting_id_fkey";
            columns: ["meeting_id"];
            isOneToOne: false;
            referencedRelation: "meetings";
            referencedColumns: ["id"];
          },
        ];
      };
      key_decisions: {
        Row: {
          id: string;
          meeting_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          meeting_id?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "key_decisions_meeting_id_fkey";
            columns: ["meeting_id"];
            isOneToOne: false;
            referencedRelation: "meetings";
            referencedColumns: ["id"];
          },
        ];
      };
      follow_up_questions: {
        Row: {
          id: string;
          meeting_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          meeting_id?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "follow_up_questions_meeting_id_fkey";
            columns: ["meeting_id"];
            isOneToOne: false;
            referencedRelation: "meetings";
            referencedColumns: ["id"];
          },
        ];
      };
      role_permissions: {
        Row: {
          id: string;
          role: string;
          permissions: string[];
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          role: string;
          permissions?: string[];
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: string;
          permissions?: string[];
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      activity_events: {
        Row: {
          id: string;
          user_id: string | null;
          event_type: string;
          metadata: Json;
          device_category: string | null;
          browser: string | null;
          country: string | null;
          city: string | null;
          referrer: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          event_type: string;
          metadata?: Json;
          device_category?: string | null;
          browser?: string | null;
          country?: string | null;
          city?: string | null;
          referrer?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          event_type?: string;
          metadata?: Json;
          device_category?: string | null;
          browser?: string | null;
          country?: string | null;
          city?: string | null;
          referrer?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_audit_logs: {
        Row: {
          id: string;
          actor_id: string;
          actor_email: string;
          action: string;
          target_id: string | null;
          target_type: string;
          details: Json;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id: string;
          actor_email: string;
          action: string;
          target_id?: string | null;
          target_type: string;
          details?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string;
          actor_email?: string;
          action?: string;
          target_id?: string | null;
          target_type?: string;
          details?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      usage_tracking: {
        Row: {
          id: string;
          user_id: string;
          month: string;
          meetings_generated: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          month: string;
          meetings_generated?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          month?: string;
          meetings_generated?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "usage_tracking_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_monthly_usage: {
        Args: {
          p_month: string;
          p_max_limit?: number;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
