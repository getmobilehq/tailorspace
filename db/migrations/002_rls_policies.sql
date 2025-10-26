-- Row Level Security (RLS) Policies for TailorSpace

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.runner_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_sessions ENABLE ROW LEVEL SECURITY;

-- Users Policies
CREATE POLICY users_select_own
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY users_update_own
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Admin can view all users
CREATE POLICY users_admin_select
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Orders Policies - Customers
CREATE POLICY orders_customer_select
  ON public.orders FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY orders_customer_insert
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Orders Policies - Tailors
CREATE POLICY orders_tailor_select
  ON public.orders FOR SELECT
  USING (auth.uid() = tailor_id);

CREATE POLICY orders_tailor_update
  ON public.orders FOR UPDATE
  USING (auth.uid() = tailor_id);

-- Orders Policies - Runners
CREATE POLICY orders_runner_select
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.runner_assignments
      WHERE order_id = orders.id AND runner_id = auth.uid()
    )
  );

-- Orders Policies - Admins
CREATE POLICY orders_admin_all
  ON public.orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Payments Policies
CREATE POLICY payments_customer_select
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = payments.order_id AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY payments_admin_all
  ON public.payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Feedback Policies
CREATE POLICY feedback_customer_all
  ON public.feedback FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY feedback_tailor_select
  ON public.feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = feedback.order_id AND orders.tailor_id = auth.uid()
    )
  );

CREATE POLICY feedback_admin_select
  ON public.feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Notifications Policies
CREATE POLICY notifications_recipient_select
  ON public.notifications FOR SELECT
  USING (auth.uid() = recipient_id);

CREATE POLICY notifications_admin_all
  ON public.notifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Runner Assignments Policies
CREATE POLICY runner_assignments_runner_select
  ON public.runner_assignments FOR SELECT
  USING (auth.uid() = runner_id);

CREATE POLICY runner_assignments_runner_update
  ON public.runner_assignments FOR UPDATE
  USING (auth.uid() = runner_id);

CREATE POLICY runner_assignments_admin_all
  ON public.runner_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- AI Metadata Policies
CREATE POLICY ai_metadata_customer_select
  ON public.ai_metadata FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = ai_metadata.order_id AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY ai_metadata_admin_all
  ON public.ai_metadata FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Support Sessions Policies
CREATE POLICY support_sessions_user_all
  ON public.support_sessions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY support_sessions_admin_all
  ON public.support_sessions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Services are public (no RLS needed)
-- Event logs are admin-only (handled in application layer)
