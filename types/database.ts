export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tracks: {
        Row: {
          id: string
          user_id: string
          title: string
          artist: string
          duration: number
          file_url: string
          file_path: string
          file_size: number
          upload_date: string
          metadata: Json | null
          genre: string | null
          cover_art: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          artist: string
          duration: number
          file_url: string
          file_path: string
          file_size: number
          upload_date?: string
          metadata?: Json | null
          genre?: string | null
          cover_art?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          artist?: string
          duration?: number
          file_url?: string
          file_path?: string
          file_size?: number
          upload_date?: string
          metadata?: Json | null
          genre?: string | null
          cover_art?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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