
-- Create enum types
CREATE TYPE public.user_role AS ENUM ('admin', 'tech_lead', 'sales_manager', 'telecaller');
CREATE TYPE public.lead_status AS ENUM ('New', 'Contacted', 'Follow-up', 'Interested', 'Not Interested', 'Converted');
CREATE TYPE public.project_status AS ENUM ('Planning', 'In Progress', 'Review', 'Completed', 'On Hold');
CREATE TYPE public.notification_type AS ENUM ('follow_up', 'assignment', 'conversion', 'info');
CREATE TYPE public.project_request_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.activity_type AS ENUM (
  'lead_added', 'lead_updated', 'lead_deleted', 'lead_status_changed', 'lead_assigned',
  'lead_note_added', 'project_added', 'project_deleted', 'project_status_changed',
  'project_renamed', 'project_deadline_set', 'developer_assigned', 'developer_added',
  'developer_removed', 'user_added', 'user_removed', 'folder_added', 'folder_deleted',
  'project_request_created', 'project_request_approved', 'project_request_rejected'
);

-- Users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  username TEXT,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  dob TEXT,
  address TEXT,
  profile_pic TEXT,
  password TEXT,
  role public.user_role NOT NULL DEFAULT 'telecaller',
  avatar TEXT,
  joining_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lead folders
CREATE TABLE public.lead_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  company TEXT,
  status public.lead_status NOT NULL DEFAULT 'New',
  assigned_to TEXT,
  source TEXT,
  social_media JSONB DEFAULT '{}',
  follow_up_date TEXT,
  folder_id UUID REFERENCES public.lead_folders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notes (for leads and projects)
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  created_by TEXT NOT NULL DEFAULT '',
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  project_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Developers
CREATE TABLE public.developers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL DEFAULT '',
  client_email TEXT NOT NULL DEFAULT '',
  client_phone TEXT NOT NULL DEFAULT '',
  status public.project_status NOT NULL DEFAULT 'Planning',
  assigned_to TEXT NOT NULL DEFAULT '',
  assigned_developer TEXT,
  deadline TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add FK for notes.project_id
ALTER TABLE public.notes ADD CONSTRAINT notes_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  type public.notification_type NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activities
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.activity_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  user_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Project requests
CREATE TABLE public.project_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id TEXT NOT NULL,
  lead_name TEXT NOT NULL DEFAULT '',
  project_name TEXT NOT NULL,
  client_name TEXT NOT NULL DEFAULT '',
  client_email TEXT NOT NULL DEFAULT '',
  client_phone TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  requested_by TEXT NOT NULL DEFAULT '',
  status public.project_request_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;

-- Since we're using mock login (no Supabase Auth), allow all access via anon key
CREATE POLICY "Allow all access to users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to lead_folders" ON public.lead_folders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to leads" ON public.leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to notes" ON public.notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to developers" ON public.developers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to activities" ON public.activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to project_requests" ON public.project_requests FOR ALL USING (true) WITH CHECK (true);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default users
INSERT INTO public.users (id, name, email, phone, role, joining_date, password) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Admin', 'admin@enterprisecrm.com', '+919000000001', 'admin', '2025-01-01', 'Admin123'),
  ('00000000-0000-0000-0000-000000000002', 'Tushar', 'tushar@enterprisecrm.com', '+919000000002', 'tech_lead', '2025-02-15', 'Tushar123'),
  ('00000000-0000-0000-0000-000000000003', 'Vansh', 'vansh@enterprisecrm.com', '+919000000003', 'sales_manager', '2025-03-01', 'Vansh123'),
  ('00000000-0000-0000-0000-000000000004', 'Akanksha', 'akanksha@enterprisecrm.com', '+919000000004', 'telecaller', '2025-04-10', 'Akanksha123');

-- Seed default developers
INSERT INTO public.developers (id, name) VALUES
  ('00000000-0000-0000-0000-000000000011', 'Rohit Verma'),
  ('00000000-0000-0000-0000-000000000012', 'Neha Singh'),
  ('00000000-0000-0000-0000-000000000013', 'Karan Mehta'),
  ('00000000-0000-0000-0000-000000000014', 'Divya Joshi');
