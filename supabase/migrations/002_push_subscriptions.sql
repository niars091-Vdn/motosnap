-- Push subscriptions table
CREATE TABLE public.push_subscriptions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint     TEXT NOT NULL UNIQUE,
  p256dh       TEXT NOT NULL,
  auth         TEXT NOT NULL,
  user_agent   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "push: own user" ON public.push_subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_push_user ON public.push_subscriptions(user_id);

-- Notification queue (per invii programmati/admin)
CREATE TABLE public.notification_queue (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target      TEXT NOT NULL DEFAULT 'all',  -- 'all' | user_id specifico
  type        TEXT NOT NULL CHECK (type IN ('offer','maint','news','generic')),
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  url         TEXT DEFAULT '/',
  price       TEXT,
  image       TEXT,
  scheduled_at TIMESTAMPTZ,
  sent_at     TIMESTAMPTZ,
  sent_count  INTEGER DEFAULT 0,
  created_by  UUID REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "queue: admin only" ON public.notification_queue FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
