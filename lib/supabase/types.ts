// lib/supabase/types.ts
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];
export interface Database {
  public: {
    Tables: {
      profiles: { Row: { id: string; role: "anon"|"authenticated"|"staff"|"admin"|"doctor"|string; full_name: string|null } };
      doctors:  { Row: { id: string; profile_id: string } };
      appointment_slots: { Row: {
        id: string; doctor_id: string; starts_at: string; ends_at: string; capacity: number; created_at: string;
      } };
    };
    Functions: {};
  };
}