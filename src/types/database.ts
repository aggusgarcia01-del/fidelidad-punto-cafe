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
      users: {
        Row: {
          id: string;
          full_name: string;
          dni: string | null;
          phone: string | null;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          dni?: string | null;
          phone?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          dni?: string | null;
          phone?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      loyalty_cards: {
        Row: {
          id: string;
          user_id: string | null;
          stamps: number;
          total_rewards: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          stamps?: number;
          total_rewards?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          stamps?: number;
          total_rewards?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "loyalty_cards_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      loyalty_events: {
        Row: {
          id: string;
          user_id: string | null;
          card_id: string | null;
          type: "stamp_added" | "reward_redeemed";
          stamps_before: number;
          stamps_after: number;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          card_id?: string | null;
          type: "stamp_added" | "reward_redeemed";
          stamps_before: number;
          stamps_after: number;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          card_id?: string | null;
          type?: "stamp_added" | "reward_redeemed";
          stamps_before?: number;
          stamps_after?: number;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "loyalty_events_card_id_fkey";
            columns: ["card_id"];
            isOneToOne: false;
            referencedRelation: "loyalty_cards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loyalty_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      stamps: {
        Row: {
          id: string;
          user_id: string;
          stamped_at: string;
          note: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          stamped_at?: string;
          note?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          stamped_at?: string;
          note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "stamps_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type LoyaltyCustomer = Database["public"]["Tables"]["users"]["Row"] & {
  loyalty_cards:
    | Array<Database["public"]["Tables"]["loyalty_cards"]["Row"]>
    | Database["public"]["Tables"]["loyalty_cards"]["Row"]
    | null;
};

export type LoyaltyEvent = Database["public"]["Tables"]["loyalty_events"]["Row"];
