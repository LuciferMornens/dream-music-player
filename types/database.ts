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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      tracks: {
        Row: {
          artist: string
          cover_art: string | null
          duration: number
          file_path: string
          file_size: number
          file_url: string
          genre: string | null
          id: string
          metadata: Json | null
          title: string
          upload_date: string | null
          user_id: string | null
        }
        Insert: {
          artist: string
          cover_art?: string | null
          duration: number
          file_path: string
          file_size: number
          file_url: string
          genre?: string | null
          id?: string
          metadata?: Json | null
          title: string
          upload_date?: string | null
          user_id?: string | null
        }
        Update: {
          artist?: string
          cover_art?: string | null
          duration?: number
          file_path?: string
          file_size?: number
          file_url?: string
          genre?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          upload_date?: string | null
          user_id?: string | null
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Track = Database['public']['Tables']['tracks']['Row']
export type InsertProfile = Database['public']['Tables']['profiles']['Insert']
export type InsertTrack = Database['public']['Tables']['tracks']['Insert']
export type UpdateProfile = Database['public']['Tables']['profiles']['Update']
export type UpdateTrack = Database['public']['Tables']['tracks']['Update']