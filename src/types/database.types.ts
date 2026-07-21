export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AgentTypeEnum =
  | 'InputNormalizer'
  | 'Orchestrator'
  | 'PM'
  | 'UIUX'
  | 'Architecture'
  | 'Developer'
  | 'Content'
  | 'QA'
  | 'Deployment'
  | 'Documentation';

export type ProjectStatusEnum =
  | 'Draft'
  | 'Requirements'
  | 'Planning'
  | 'Execution'
  | 'QA'
  | 'Review'
  | 'Completed'
  | 'Cancelled';

export type ProjectTypeEnum = 'Website' | 'SaaS' | 'Mobile App';
export type LogStatusEnum = 'Success' | 'Failed' | 'Retrying';
export type AssetTypeEnum = 'Document' | 'Image' | 'Code' | 'Wireframe' | 'Other';
export type ProfileRoleEnum = 'Founder' | 'Client';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: ProfileRoleEnum;
          full_name: string | null;
          company_name: string | null;
          phone_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: ProfileRoleEnum;
          full_name?: string | null;
          company_name?: string | null;
          phone_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: ProfileRoleEnum;
          full_name?: string | null;
          company_name?: string | null;
          phone_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          client_id: string | null;
          status: ProjectStatusEnum;
          type: ProjectTypeEnum;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id?: string | null;
          status?: ProjectStatusEnum;
          type: ProjectTypeEnum;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string | null;
          status?: ProjectStatusEnum;
          type?: ProjectTypeEnum;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      project_state: {
        Row: {
          id: string;
          project_id: string;
          state_data: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          state_data?: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          state_data?: Json;
          updated_at?: string;
        };
      };
      ai_logs: {
        Row: {
          id: string;
          project_id: string;
          agent_type: AgentTypeEnum;
          action: string;
          payload: Json | null;
          status: LogStatusEnum;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          agent_type: AgentTypeEnum;
          action: string;
          payload?: Json | null;
          status: LogStatusEnum;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          agent_type?: AgentTypeEnum;
          action?: string;
          payload?: Json | null;
          status?: LogStatusEnum;
          created_at?: string;
        };
      };
      assets: {
        Row: {
          id: string;
          project_id: string;
          file_url: string;
          asset_type: AssetTypeEnum;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          file_url: string;
          asset_type: AssetTypeEnum;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          file_url?: string;
          asset_type?: AssetTypeEnum;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
