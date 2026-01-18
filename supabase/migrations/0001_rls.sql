-- Basic ownership columns (add only if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'file' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.file ADD COLUMN user_id uuid REFERENCES auth.users (id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'interest' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.interest ADD COLUMN user_id uuid REFERENCES auth.users (id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_notification' AND column_name = 'user_auth_id'
  ) THEN
    ALTER TABLE public.user_notification ADD COLUMN user_auth_id uuid REFERENCES auth.users (id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_junior ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_senior ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_thread ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification ENABLE ROW LEVEL SECURITY;

-- users: only the owner can read/update their row
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_select_own') THEN
    CREATE POLICY users_select_own ON public.users FOR SELECT USING (auth_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_update_own') THEN
    CREATE POLICY users_update_own ON public.users FOR UPDATE USING (auth_id = auth.uid()) WITH CHECK (auth_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'users_insert_own') THEN
    CREATE POLICY users_insert_own ON public.users FOR INSERT WITH CHECK (auth_id = auth.uid());
  END IF;
END $$;

-- interest: scoped to the owner
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'interest' AND policyname = 'interest_owner_all') THEN
    CREATE POLICY interest_owner_all ON public.interest
      FOR ALL
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- file: owner-only access
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'file' AND policyname = 'file_owner_all') THEN
    CREATE POLICY file_owner_all ON public.file
      FOR ALL
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- post_junior: public read for DONE, otherwise owner only; writes restricted to owner
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'post_junior' AND policyname = 'post_junior_select') THEN
    CREATE POLICY post_junior_select ON public.post_junior
      FOR SELECT
      USING (status = 'DONE' OR user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'post_junior' AND policyname = 'post_junior_write') THEN
    CREATE POLICY post_junior_write ON public.post_junior
      FOR ALL
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- post_senior: public read for DONE, otherwise owner only; writes restricted to owner
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'post_senior' AND policyname = 'post_senior_select') THEN
    CREATE POLICY post_senior_select ON public.post_senior
      FOR SELECT
      USING (status = 'DONE' OR user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'post_senior' AND policyname = 'post_senior_write') THEN
    CREATE POLICY post_senior_write ON public.post_senior
      FOR ALL
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- message_thread: participants only
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'message_thread' AND policyname = 'message_thread_participants_select') THEN
    CREATE POLICY message_thread_participants_select ON public.message_thread
      FOR SELECT
      USING (starter_user_id = auth.uid() OR target_user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'message_thread' AND policyname = 'message_thread_participants_write') THEN
    CREATE POLICY message_thread_participants_write ON public.message_thread
      FOR INSERT
      WITH CHECK (starter_user_id = auth.uid());
  END IF;
END $$;

-- message: only participants of the thread can read/write; sender must match auth.uid()
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'message' AND policyname = 'message_participants_select') THEN
    CREATE POLICY message_participants_select ON public.message
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.message_thread mt
          WHERE mt.id = thread_id
            AND (mt.starter_user_id = auth.uid() OR mt.target_user_id = auth.uid())
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'message' AND policyname = 'message_participants_write') THEN
    CREATE POLICY message_participants_write ON public.message
      FOR ALL
      USING (
        sender_id = auth.uid()
        AND EXISTS (
          SELECT 1 FROM public.message_thread mt
          WHERE mt.id = thread_id
            AND (mt.starter_user_id = auth.uid() OR mt.target_user_id = auth.uid())
        )
      )
      WITH CHECK (
        sender_id = auth.uid()
        AND EXISTS (
          SELECT 1 FROM public.message_thread mt
          WHERE mt.id = thread_id
            AND (mt.starter_user_id = auth.uid() OR mt.target_user_id = auth.uid())
        )
      );
  END IF;
END $$;

-- user_notification: scoped to the recipient
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_notification' AND policyname = 'user_notification_owner_all') THEN
    CREATE POLICY user_notification_owner_all ON public.user_notification
      FOR ALL
      USING (user_auth_id = auth.uid())
      WITH CHECK (user_auth_id = auth.uid());
  END IF;
END $$;
