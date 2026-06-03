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
        Insert: any
        Update: any
      }
      bikes: { Row: any; Insert: any; Update: any }
      scans: { Row: any; Insert: any; Update: any }
      wishlist: { Row: any; Insert: any; Update: any }
      community_posts: { Row: any; Insert: any; Update: any }
      community_replies: { Row: any; Insert: any; Update: any }
      post_likes: { Row: any; Insert: any; Update: any }
      notifications: { Row: any; Insert: any; Update: any }
      affiliate_clicks: { Row: any; Insert: any; Update: any }
      api_usage: { Row: any; Insert: any; Update: any }
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
