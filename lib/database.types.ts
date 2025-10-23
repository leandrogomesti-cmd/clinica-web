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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointment_slots: {
        Row: {
          capacity: number
          created_at: string
          doctor_id: string
          ends_at: string
          id: string
          starts_at: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          doctor_id: string
          ends_at: string
          id?: string
          starts_at: string
        }
        Update: {
          capacity?: number
          created_at?: string
          doctor_id?: string
          ends_at?: string
          id?: string
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_slots_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          created_at: string
          currency: string
          doctor_id: string | null
          end_time: string
          id: string
          notes: string | null
          patient_id: string
          payment_status: string
          price_cents: number
          service_id: string | null
          source: string | null
          start_time: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          doctor_id?: string | null
          end_time: string
          id?: string
          notes?: string | null
          patient_id: string
          payment_status?: string
          price_cents?: number
          service_id?: string | null
          source?: string | null
          start_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          doctor_id?: string | null
          end_time?: string
          id?: string
          notes?: string | null
          patient_id?: string
          payment_status?: string
          price_cents?: number
          service_id?: string | null
          source?: string | null
          start_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          gcal_calendar_id: string | null
          id: string
          name: string
          profile_id: string | null
          specialty: string | null
        }
        Insert: {
          gcal_calendar_id?: string | null
          id?: string
          name: string
          profile_id?: string | null
          specialty?: string | null
        }
        Update: {
          gcal_calendar_id?: string | null
          id?: string
          name?: string
          profile_id?: string | null
          specialty?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pacientes_intake: {
        Row: {
          alergias: string | null
          approved_at: string | null
          approved_by: string | null
          bairro: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          convenio: string | null
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          doencas_cronicas: string | null
          email: string | null
          estado: string | null
          estado_civil: Database["public"]["Enums"]["estado_civil_tipo"] | null
          historico_cirurgico: string | null
          id: string
          logradouro: string | null
          medicamentos_uso: string | null
          nome: string
          numero: string | null
          numero_carteirinha: string | null
          observacoes: string | null
          profissao: string | null
          reject_reason: string | null
          rejected_at: string | null
          rejected_by: string | null
          rg: string | null
          sexo: Database["public"]["Enums"]["sexo_tipo"] | null
          status: string
          telefone: string | null
          telefone_fixo: string | null
          telefone_whatsapp: string
          titular_plano: string | null
          updated_at: string
          validade_carteirinha: string | null
        }
        Insert: {
          alergias?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          convenio?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          doencas_cronicas?: string | null
          email?: string | null
          estado?: string | null
          estado_civil?: Database["public"]["Enums"]["estado_civil_tipo"] | null
          historico_cirurgico?: string | null
          id?: string
          logradouro?: string | null
          medicamentos_uso?: string | null
          nome: string
          numero?: string | null
          numero_carteirinha?: string | null
          observacoes?: string | null
          profissao?: string | null
          reject_reason?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rg?: string | null
          sexo?: Database["public"]["Enums"]["sexo_tipo"] | null
          status?: string
          telefone?: string | null
          telefone_fixo?: string | null
          telefone_whatsapp: string
          titular_plano?: string | null
          updated_at?: string
          validade_carteirinha?: string | null
        }
        Update: {
          alergias?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          convenio?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          doencas_cronicas?: string | null
          email?: string | null
          estado?: string | null
          estado_civil?: Database["public"]["Enums"]["estado_civil_tipo"] | null
          historico_cirurgico?: string | null
          id?: string
          logradouro?: string | null
          medicamentos_uso?: string | null
          nome?: string
          numero?: string | null
          numero_carteirinha?: string | null
          observacoes?: string | null
          profissao?: string | null
          reject_reason?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rg?: string | null
          sexo?: Database["public"]["Enums"]["sexo_tipo"] | null
          status?: string
          telefone?: string | null
          telefone_fixo?: string | null
          telefone_whatsapp?: string
          titular_plano?: string | null
          updated_at?: string
          validade_carteirinha?: string | null
        }
        Relationships: []
      }
      pacientes_legacy_arquivado: {
        Row: {
          alergias: string | null
          bairro: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          convenio: string | null
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          doencas_cronicas: string | null
          email: string | null
          estado: string | null
          estado_civil: Database["public"]["Enums"]["estado_civil_tipo"] | null
          historico_cirurgico: string | null
          id: string
          logradouro: string | null
          medicamentos_uso: string | null
          nome: string
          numero: string | null
          numero_carteirinha: string | null
          profissao: string | null
          rg: string | null
          sexo: Database["public"]["Enums"]["sexo_tipo"] | null
          telefone_fixo: string | null
          telefone_whatsapp: string
          titular_plano: string | null
          updated_at: string
          validade_carteirinha: string | null
        }
        Insert: {
          alergias?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          convenio?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          doencas_cronicas?: string | null
          email?: string | null
          estado?: string | null
          estado_civil?: Database["public"]["Enums"]["estado_civil_tipo"] | null
          historico_cirurgico?: string | null
          id?: string
          logradouro?: string | null
          medicamentos_uso?: string | null
          nome: string
          numero?: string | null
          numero_carteirinha?: string | null
          profissao?: string | null
          rg?: string | null
          sexo?: Database["public"]["Enums"]["sexo_tipo"] | null
          telefone_fixo?: string | null
          telefone_whatsapp: string
          titular_plano?: string | null
          updated_at?: string
          validade_carteirinha?: string | null
        }
        Update: {
          alergias?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          convenio?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          doencas_cronicas?: string | null
          email?: string | null
          estado?: string | null
          estado_civil?: Database["public"]["Enums"]["estado_civil_tipo"] | null
          historico_cirurgico?: string | null
          id?: string
          logradouro?: string | null
          medicamentos_uso?: string | null
          nome?: string
          numero?: string | null
          numero_carteirinha?: string | null
          profissao?: string | null
          rg?: string | null
          sexo?: Database["public"]["Enums"]["sexo_tipo"] | null
          telefone_fixo?: string | null
          telefone_whatsapp?: string
          titular_plano?: string | null
          updated_at?: string
          validade_carteirinha?: string | null
        }
        Relationships: []
      }
      patient_documents: {
        Row: {
          created_at: string | null
          id: string
          intake_id: string | null
          ocr_raw: Json | null
          ocr_vendor: string | null
          status: string
          storage_path: string
          type: string
          updated_at: string | null
          uploader_role: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          intake_id?: string | null
          ocr_raw?: Json | null
          ocr_vendor?: string | null
          status?: string
          storage_path: string
          type: string
          updated_at?: string | null
          uploader_role: string
        }
        Update: {
          created_at?: string | null
          id?: string
          intake_id?: string | null
          ocr_raw?: Json | null
          ocr_vendor?: string | null
          status?: string
          storage_path?: string
          type?: string
          updated_at?: string | null
          uploader_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_documents_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "pacientes_intake"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_documents_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "vw_pacientes_intake_admin"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_documents_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "vw_pacientes_intake_ui"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          alergias: string | null
          bairro: string | null
          birth_date: string | null
          cep: string | null
          city: string | null
          complemento: string | null
          consent_accepted_at: string | null
          consent_version: string | null
          convenio: string | null
          cpf: string | null
          created_at: string
          created_by: string | null
          document_encrypted: string | null
          doencas_cronicas: string | null
          email: string | null
          estado_civil: string | null
          full_name: string
          historico_cirurgico: string | null
          id: string
          logradouro: string | null
          medicamentos_uso: string | null
          numero: string | null
          numero_carteirinha: string | null
          phone: string | null
          profissao: string | null
          rg: string | null
          sexo: string | null
          state: string | null
          telefone: string | null
          titular_plano: string | null
          updated_at: string
          validade_carteirinha: string | null
        }
        Insert: {
          address?: string | null
          alergias?: string | null
          bairro?: string | null
          birth_date?: string | null
          cep?: string | null
          city?: string | null
          complemento?: string | null
          consent_accepted_at?: string | null
          consent_version?: string | null
          convenio?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          document_encrypted?: string | null
          doencas_cronicas?: string | null
          email?: string | null
          estado_civil?: string | null
          full_name: string
          historico_cirurgico?: string | null
          id?: string
          logradouro?: string | null
          medicamentos_uso?: string | null
          numero?: string | null
          numero_carteirinha?: string | null
          phone?: string | null
          profissao?: string | null
          rg?: string | null
          sexo?: string | null
          state?: string | null
          telefone?: string | null
          titular_plano?: string | null
          updated_at?: string
          validade_carteirinha?: string | null
        }
        Update: {
          address?: string | null
          alergias?: string | null
          bairro?: string | null
          birth_date?: string | null
          cep?: string | null
          city?: string | null
          complemento?: string | null
          consent_accepted_at?: string | null
          consent_version?: string | null
          convenio?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          document_encrypted?: string | null
          doencas_cronicas?: string | null
          email?: string | null
          estado_civil?: string | null
          full_name?: string
          historico_cirurgico?: string | null
          id?: string
          logradouro?: string | null
          medicamentos_uso?: string | null
          numero?: string | null
          numero_carteirinha?: string | null
          phone?: string | null
          profissao?: string | null
          rg?: string | null
          sexo?: string | null
          state?: string | null
          telefone?: string | null
          titular_plano?: string | null
          updated_at?: string
          validade_carteirinha?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_intents: {
        Row: {
          amount_cents: number
          appointment_id: string
          created_at: string
          currency: string
          expires_at: string | null
          id: string
          provider: string
          provider_charge_id: string | null
          provider_checkout_url: string | null
          public_token: string | null
          qr_code_base64: string | null
          qr_code_payload: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          appointment_id: string
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          provider: string
          provider_charge_id?: string | null
          provider_checkout_url?: string | null
          public_token?: string | null
          qr_code_base64?: string | null
          qr_code_payload?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          appointment_id?: string
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          provider?: string
          provider_charge_id?: string | null
          provider_checkout_url?: string | null
          public_token?: string | null
          qr_code_base64?: string | null
          qr_code_payload?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_intents_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_webhook_events: {
        Row: {
          event_type: string
          handled: boolean
          handled_at: string | null
          id: string
          provider: string
          raw_payload: Json
          received_at: string
        }
        Insert: {
          event_type: string
          handled?: boolean
          handled_at?: string | null
          id?: string
          provider: string
          raw_payload: Json
          received_at?: string
        }
        Update: {
          event_type?: string
          handled?: boolean
          handled_at?: string | null
          id?: string
          provider?: string
          raw_payload?: Json
          received_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cents: number
          appointment_id: string
          created_at: string
          currency: string
          fee_cents: number
          id: string
          net_amount_cents: number | null
          paid_at: string
          payment_intent_id: string | null
          provider: string
          provider_payment_id: string | null
          status: string
        }
        Insert: {
          amount_cents: number
          appointment_id: string
          created_at?: string
          currency?: string
          fee_cents?: number
          id?: string
          net_amount_cents?: number | null
          paid_at: string
          payment_intent_id?: string | null
          provider: string
          provider_payment_id?: string | null
          status: string
        }
        Update: {
          amount_cents?: number
          appointment_id?: string
          created_at?: string
          currency?: string
          fee_cents?: number
          id?: string
          net_amount_cents?: number | null
          paid_at?: string
          payment_intent_id?: string | null
          provider?: string
          provider_payment_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payment_intent_id_fkey"
            columns: ["payment_intent_id"]
            isOneToOne: false
            referencedRelation: "payment_intents"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          role: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean
          duration_min: number
          id: string
          name: string
          price_cents: number
        }
        Insert: {
          active?: boolean
          duration_min?: number
          id?: string
          name: string
          price_cents?: number
        }
        Update: {
          active?: boolean
          duration_min?: number
          id?: string
          name?: string
          price_cents?: number
        }
        Relationships: []
      }
      wa_contacts: {
        Row: {
          created_at: string | null
          name: string | null
          profile_id: string | null
          wa_id: string
        }
        Insert: {
          created_at?: string | null
          name?: string | null
          profile_id?: string | null
          wa_id: string
        }
        Update: {
          created_at?: string | null
          name?: string | null
          profile_id?: string | null
          wa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wa_contacts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wa_messages: {
        Row: {
          body: string | null
          created_at: string | null
          direction: string
          id: number
          raw: Json | null
          wa_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          direction: string
          id?: number
          raw?: Json | null
          wa_id: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          direction?: string
          id?: number
          raw?: Json | null
          wa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wa_messages_wa_id_fkey"
            columns: ["wa_id"]
            isOneToOne: false
            referencedRelation: "wa_contacts"
            referencedColumns: ["wa_id"]
          },
        ]
      }
    }
    Views: {
      v_financeiro_resumo: {
        Row: {
          dia: string | null
          total_a_receber_cents: number | null
          total_consultas: number | null
          total_pago_cents: number | null
        }
        Relationships: []
      }
      vw_pacientes_dashboard: {
        Row: {
          cidade: string | null
          convenio: string | null
          created_at: string | null
          data_nascimento: string | null
          email: string | null
          estado: string | null
          estado_civil: Database["public"]["Enums"]["estado_civil_tipo"] | null
          id: string | null
          nome: string | null
          sexo: Database["public"]["Enums"]["sexo_tipo"] | null
          telefone_whatsapp: string | null
          updated_at: string | null
        }
        Insert: {
          cidade?: string | null
          convenio?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          estado?: string | null
          estado_civil?: Database["public"]["Enums"]["estado_civil_tipo"] | null
          id?: string | null
          nome?: string | null
          sexo?: Database["public"]["Enums"]["sexo_tipo"] | null
          telefone_whatsapp?: string | null
          updated_at?: string | null
        }
        Update: {
          cidade?: string | null
          convenio?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          estado?: string | null
          estado_civil?: Database["public"]["Enums"]["estado_civil_tipo"] | null
          id?: string | null
          nome?: string | null
          sexo?: Database["public"]["Enums"]["sexo_tipo"] | null
          telefone_whatsapp?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vw_pacientes_intake_admin: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          id: string | null
          nome: string | null
          phone: string | null
          reject_reason: string | null
          rejected_at: string | null
          rejected_by: string | null
          status: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string | null
          nome?: never
          phone?: never
          reject_reason?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          status?: never
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string | null
          nome?: never
          phone?: never
          reject_reason?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          status?: never
        }
        Relationships: []
      }
      vw_pacientes_intake_ui: {
        Row: {
          cpf: string | null
          created_at: string | null
          id: string | null
          nome: string | null
          status: string | null
          telefone: string | null
        }
        Insert: {
          cpf?: string | null
          created_at?: string | null
          id?: string | null
          nome?: string | null
          status?: never
          telefone?: string | null
        }
        Update: {
          cpf?: string | null
          created_at?: string | null
          id?: string | null
          nome?: string | null
          status?: never
          telefone?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cpf_valido: { Args: { cpf_text: string }; Returns: boolean }
      klinikia_has_role: { Args: { roles: string[] }; Returns: boolean }
      only_digits: { Args: { "": string }; Returns: string }
      promover_intake_paciente: { Args: { intake_id: string }; Returns: string }
      rejeitar_intake_paciente: {
        Args: { p_intake_id: string; p_motivo?: string }
        Returns: undefined
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      wa_ingest: { Args: { in_payload: Json }; Returns: undefined }
    }
    Enums: {
      estado_civil_tipo:
        | "SOLTEIRO"
        | "CASADO"
        | "DIVORCIADO"
        | "VIUVO"
        | "UNIAO_ESTAVEL"
        | "OUTRO"
        | "NAO_INFORMADO"
      sexo_tipo: "M" | "F" | "OUTRO" | "NAO_INFORMADO"
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
      estado_civil_tipo: [
        "SOLTEIRO",
        "CASADO",
        "DIVORCIADO",
        "VIUVO",
        "UNIAO_ESTAVEL",
        "OUTRO",
        "NAO_INFORMADO",
      ],
      sexo_tipo: ["M", "F", "OUTRO", "NAO_INFORMADO"],
    },
  },
} as const
