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
          email: string
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vitality_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          energy_level: number | null
          mood: number | null
          sleep_hours: number | null
          water_intake: number
          exercise_minutes: number
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          energy_level?: number | null
          mood?: number | null
          sleep_hours?: number | null
          water_intake?: number
          exercise_minutes?: number
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          energy_level?: number | null
          mood?: number | null
          sleep_hours?: number | null
          water_intake?: number
          exercise_minutes?: number
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          target_value: number | null
          current_value: number
          category: string
          is_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string
          target_value?: number | null
          current_value?: number
          category: string
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          target_value?: number | null
          current_value?: number
          category?: string
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
