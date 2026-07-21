-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('Founder', 'Client')),
  full_name TEXT,
  company_name TEXT,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Requirements', 'Planning', 'Execution', 'QA', 'Review', 'Completed', 'Cancelled')),
  type TEXT NOT NULL CHECK (type IN ('Website', 'SaaS', 'Mobile App')),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Project State Table (JSON State for dynamic phases, milestones, active agents)
CREATE TABLE IF NOT EXISTS public.project_state (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE UNIQUE NOT NULL,
  state_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. AI Logs Table
CREATE TABLE IF NOT EXISTS public.ai_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('InputNormalizer', 'Orchestrator', 'PM', 'UIUX', 'Architecture', 'Developer', 'Content', 'QA', 'Deployment', 'Documentation')),
  action TEXT NOT NULL,
  payload JSONB,
  status TEXT NOT NULL CHECK (status IN ('Success', 'Failed', 'Retrying')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Assets Table
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('Document', 'Image', 'Code', 'Wireframe', 'Other')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Functions and Triggers for updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER update_project_state_updated_at
BEFORE UPDATE ON public.project_state
FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read and update their own profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Projects: Founders and Clients can view/edit projects they are associated with
CREATE POLICY "Clients can view own projects" ON public.projects FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = client_id);
-- (Note: A Founder admin role policy would typically be added here or bypass RLS)

-- Project State: Visible if the user has access to the project
CREATE POLICY "Users can view project state" ON public.project_state FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_state.project_id AND projects.client_id = auth.uid())
);

-- AI Logs: Visible if the user has access to the project
CREATE POLICY "Users can view project ai logs" ON public.ai_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = ai_logs.project_id AND projects.client_id = auth.uid())
);

-- Assets: Visible if the user has access to the project
CREATE POLICY "Users can view project assets" ON public.assets FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = assets.project_id AND projects.client_id = auth.uid())
);
