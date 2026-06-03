export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          avatar_url: string | null
          role: 'user' | 'admin' | 'moderator'
          api_key: string | null
          scan_count: number
          streak: number
          last_quiz: string | null
          notif_offers: boolean
          notif_maint: boolean
          notif_news: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string }
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
      }
      bikes: {
        Row: {
          id: string
          user_id: string
          brand: string
          model: string
          year: string | null
          category: string | null
          displacement: string | null
          confidence: number | null
          description: string | null
          km: number
          last_service_km: number
          added_date: string
          maint_data: Json | null
          maint_fetched_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['bikes']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['bikes']['Row']>
      }
      scans: {
        Row: {
          id: string
          user_id: string
          brand: string | null
          model: string | null
          year: string | null
          category: string | null
          displacement: string | null
          confidence: number | null
          description: string | null
          raw_result: Json | null
          added_to_garage: boolean
          bike_id: string | null
          scan_date: string
        }
        Insert: Omit<Database['public']['Tables']['scans']['Row'], 'id' | 'scan_date'>
        Update: Partial<Database['public']['Tables']['scans']['Row']>
      }
      wishlist: {
        Row: {
          id: string
          user_id: string
          product_id: string
          product_data: Json
          added_at: string
        }
        Insert: Omit<Database['public']['Tables']['wishlist']['Row'], 'id' | 'added_at'>
        Update: never
      }
      community_posts: {
        Row: {
          id: string
          user_id: string
          brand: string | null
          moto: string | null
          content: string
          likes: number
          is_hidden: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['community_posts']['Row'], 'id' | 'likes' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['community_posts']['Row']>
      }
      community_replies: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['community_replies']['Row'], 'id' | 'created_at'>
        Update: never
      }
      post_likes: {
        Row: { user_id: string; post_id: string }
        Insert: { user_id: string; post_id: string }
        Update: never
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'offer' | 'maint' | 'news' | 'system'
          title: string
          body: string
          price: string | null
          url: string | null
          is_read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Row']>
      }
      affiliate_clicks: {
        Row: {
          id: string
          user_id: string | null
          product_id: string
          shop: string
          price: number | null
          bike_brand: string | null
          bike_model: string | null
          clicked_at: string
        }
        Insert: Omit<Database['public']['Tables']['affiliate_clicks']['Row'], 'id' | 'clicked_at'>
        Update: never
      }
      api_usage: {
        Row: {
          id: string
          user_id: string | null
          endpoint: string
          input_tokens: number | null
          output_tokens: number | null
          cost_usd: number | null
          model: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['api_usage']['Row'], 'id' | 'created_at'>
        Update: never
      }
    }
    Views: {
      admin_stats: {
        Row: {
          total_users: number
          new_users_week: number
          total_scans: number
          scans_today: number
          scans_week: number
          total_bikes: number
          total_posts: number
          cost_30d: number
          affiliate_clicks_week: number
        }
      }
      top_scanned_bikes: {
        Row: { brand: string; model: string; scans: number; avg_confidence: number }
      }
    }
  }
}
