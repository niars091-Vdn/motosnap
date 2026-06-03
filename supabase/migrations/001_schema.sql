-- ═══════════════════════════════════════════════
-- MOTOSNAP — Schema Supabase (PostgreSQL)
-- ═══════════════════════════════════════════════

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for text search

-- ─────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT,
  display_name  TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  api_key       TEXT,                -- utente porta la propria key Anthropic
  scan_count    INTEGER NOT NULL DEFAULT 0,
  streak        INTEGER NOT NULL DEFAULT 0,
  last_quiz     DATE,
  notif_offers  BOOLEAN NOT NULL DEFAULT true,
  notif_maint   BOOLEAN NOT NULL DEFAULT true,
  notif_news    BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────
-- BIKES (garage)
-- ─────────────────────────────────────
CREATE TABLE public.bikes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand           TEXT NOT NULL,
  model           TEXT NOT NULL,
  year            TEXT,
  category        TEXT,
  displacement    TEXT,
  confidence      INTEGER,
  description     TEXT,
  km              INTEGER NOT NULL DEFAULT 0,
  last_service_km INTEGER NOT NULL DEFAULT 0,
  added_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  maint_data      JSONB,             -- [{ic, name, km, note}]
  maint_fetched_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────
-- SCANS (history)
-- ─────────────────────────────────────
CREATE TABLE public.scans (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand       TEXT,
  model       TEXT,
  year        TEXT,
  category    TEXT,
  displacement TEXT,
  confidence  INTEGER,
  description TEXT,
  raw_result  JSONB,
  added_to_garage BOOLEAN NOT NULL DEFAULT false,
  bike_id     UUID REFERENCES public.bikes(id) ON DELETE SET NULL,
  scan_date   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────
-- WISHLIST
-- ─────────────────────────────────────
CREATE TABLE public.wishlist (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_data JSONB NOT NULL,       -- snapshot prodotto
  added_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- ─────────────────────────────────────
-- COMMUNITY POSTS
-- ─────────────────────────────────────
CREATE TABLE public.community_posts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand       TEXT,
  moto        TEXT,
  content     TEXT NOT NULL,
  likes       INTEGER NOT NULL DEFAULT 0,
  is_hidden   BOOLEAN NOT NULL DEFAULT false,  -- moderation
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────
-- COMMUNITY REPLIES
-- ─────────────────────────────────────
CREATE TABLE public.community_replies (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id  UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content  TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────
-- POST LIKES (many-to-many)
-- ─────────────────────────────────────
CREATE TABLE public.post_likes (
  user_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id  UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, post_id)
);

-- ─────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────
CREATE TABLE public.notifications (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type     TEXT NOT NULL CHECK (type IN ('offer', 'maint', 'news', 'system')),
  title    TEXT NOT NULL,
  body     TEXT NOT NULL,
  price    TEXT,
  url      TEXT,
  is_read  BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────
-- AFFILIATE CLICKS (analytics)
-- ─────────────────────────────────────
CREATE TABLE public.affiliate_clicks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  product_id  TEXT NOT NULL,
  shop        TEXT NOT NULL,
  price       NUMERIC(10,2),
  bike_brand  TEXT,
  bike_model  TEXT,
  clicked_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────
-- API USAGE LOG (cost tracking)
-- ─────────────────────────────────────
CREATE TABLE public.api_usage (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  endpoint      TEXT NOT NULL,    -- 'scan' | 'maintenance'
  input_tokens  INTEGER,
  output_tokens INTEGER,
  cost_usd      NUMERIC(10,6),
  model         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════
-- VIEWS (per dashboard admin)
-- ═══════════════════════════════════════════════

CREATE OR REPLACE VIEW admin_stats AS
SELECT
  (SELECT COUNT(*) FROM public.profiles)                          AS total_users,
  (SELECT COUNT(*) FROM public.profiles WHERE created_at > now() - interval '7 days') AS new_users_week,
  (SELECT COUNT(*) FROM public.scans)                             AS total_scans,
  (SELECT COUNT(*) FROM public.scans WHERE scan_date > now() - interval '1 day')    AS scans_today,
  (SELECT COUNT(*) FROM public.scans WHERE scan_date > now() - interval '7 days')   AS scans_week,
  (SELECT COUNT(*) FROM public.bikes)                             AS total_bikes,
  (SELECT COUNT(*) FROM public.community_posts WHERE NOT is_hidden) AS total_posts,
  (SELECT COALESCE(SUM(cost_usd),0) FROM public.api_usage WHERE created_at > now() - interval '30 days') AS cost_30d,
  (SELECT COUNT(*) FROM public.affiliate_clicks WHERE clicked_at > now() - interval '7 days') AS affiliate_clicks_week;

CREATE OR REPLACE VIEW top_scanned_bikes AS
SELECT brand, model, COUNT(*) as scans, AVG(confidence) as avg_confidence
FROM public.scans
WHERE brand IS NOT NULL
GROUP BY brand, model
ORDER BY scans DESC
LIMIT 20;

-- ═══════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════
CREATE INDEX idx_bikes_user_id ON public.bikes(user_id);
CREATE INDEX idx_scans_user_id ON public.scans(user_id);
CREATE INDEX idx_scans_date ON public.scans(scan_date DESC);
CREATE INDEX idx_posts_brand ON public.community_posts(brand);
CREATE INDEX idx_posts_created ON public.community_posts(created_at DESC);
CREATE INDEX idx_notifs_user_unread ON public.notifications(user_id) WHERE NOT is_read;
CREATE INDEX idx_affiliate_shop ON public.affiliate_clicks(shop, clicked_at DESC);

-- ═══════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════

ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bikes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage        ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "users can view own profile"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "admins can view all"          ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- BIKES
CREATE POLICY "bikes: own user" ON public.bikes FOR ALL USING (auth.uid() = user_id);

-- SCANS
CREATE POLICY "scans: own user" ON public.scans FOR ALL USING (auth.uid() = user_id);

-- WISHLIST
CREATE POLICY "wishlist: own user" ON public.wishlist FOR ALL USING (auth.uid() = user_id);

-- COMMUNITY POSTS (public read, own write)
CREATE POLICY "posts: read all visible" ON public.community_posts FOR SELECT USING (NOT is_hidden);
CREATE POLICY "posts: own insert"       ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts: own update"       ON public.community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "posts: own delete"       ON public.community_posts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "posts: admin hide"       ON public.community_posts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','moderator'))
);

-- REPLIES
CREATE POLICY "replies: read all" ON public.community_replies FOR SELECT USING (true);
CREATE POLICY "replies: own write" ON public.community_replies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "replies: own delete" ON public.community_replies FOR DELETE USING (auth.uid() = user_id);

-- LIKES
CREATE POLICY "likes: read all" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "likes: own write" ON public.post_likes FOR ALL USING (auth.uid() = user_id);

-- NOTIFICATIONS
CREATE POLICY "notifs: own user" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- AFFILIATE CLICKS (insert only for users, admin reads all)
CREATE POLICY "affiliate: own insert" ON public.affiliate_clicks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- API USAGE
CREATE POLICY "api_usage: own insert" ON public.api_usage FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "api_usage: admin read" ON public.api_usage FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ═══════════════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update scan_count on profile when scan inserted
CREATE OR REPLACE FUNCTION public.increment_scan_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles SET scan_count = scan_count + 1, updated_at = now()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_scan_created
  AFTER INSERT ON public.scans
  FOR EACH ROW EXECUTE FUNCTION public.increment_scan_count();

-- Update post likes counter
CREATE OR REPLACE FUNCTION public.update_post_likes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts SET likes = likes + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts SET likes = likes - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_like_change
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_post_likes();

-- Update updated_at timestamps
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER set_profiles_updated_at   BEFORE UPDATE ON public.profiles         FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_bikes_updated_at      BEFORE UPDATE ON public.bikes             FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_posts_updated_at      BEFORE UPDATE ON public.community_posts   FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
