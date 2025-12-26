-- Create enum types
CREATE TYPE public.notice_type AS ENUM ('general', 'emergency', 'meeting', 'complaint', 'election', 'festival');
CREATE TYPE public.complaint_status AS ENUM ('open', 'under_review', 'resolved');
CREATE TYPE public.poll_type AS ENUM ('opinion', 'verdict', 'punishment', 'election');
CREATE TYPE public.poll_status AS ENUM ('active', 'closed');

-- Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create flats table
CREATE TABLE public.flats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building TEXT NOT NULL,
  flat_number TEXT NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL UNIQUE,
  trust_score INTEGER NOT NULL DEFAULT 50,
  chaos_score INTEGER NOT NULL DEFAULT 0,
  contribution_score INTEGER NOT NULL DEFAULT 0,
  is_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(building, flat_number)
);

-- Create notices table
CREATE TABLE public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flat_id UUID REFERENCES public.flats(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  notice_type notice_type NOT NULL DEFAULT 'general',
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create notice_votes table (track who voted)
CREATE TABLE public.notice_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id UUID REFERENCES public.notices(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(notice_id, profile_id)
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id UUID REFERENCES public.notices(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  flat_id UUID REFERENCES public.flats(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create complaints table
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flat_id UUID REFERENCES public.flats(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  target_flat_id UUID REFERENCES public.flats(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  status complaint_status NOT NULL DEFAULT 'open',
  agrees INTEGER NOT NULL DEFAULT 0,
  disagrees INTEGER NOT NULL DEFAULT 0,
  mocks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create complaint_reactions table
CREATE TABLE public.complaint_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('agree', 'disagree', 'mock')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(complaint_id, profile_id)
);

-- Create polls table
CREATE TABLE public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flat_id UUID REFERENCES public.flats(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  poll_type poll_type NOT NULL DEFAULT 'opinion',
  status poll_status NOT NULL DEFAULT 'active',
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create poll_options table
CREATE TABLE public.poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  option_text TEXT NOT NULL,
  votes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create poll_votes table (one vote per flat)
CREATE TABLE public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE NOT NULL,
  flat_id UUID REFERENCES public.flats(id) ON DELETE CASCADE NOT NULL,
  voter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(poll_id, flat_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notice_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Flats policies (viewable by all, claimable by authenticated users)
CREATE POLICY "Flats are viewable by everyone" ON public.flats FOR SELECT USING (true);
CREATE POLICY "Authenticated users can claim unclaimed flats" ON public.flats FOR UPDATE TO authenticated USING (true);

-- Notices policies
CREATE POLICY "Notices are viewable by everyone" ON public.notices FOR SELECT USING (true);
CREATE POLICY "Flat owners can create notices" ON public.notices FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.flats WHERE id = flat_id AND owner_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);
CREATE POLICY "Authors can update own notices" ON public.notices FOR UPDATE TO authenticated USING (
  author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Authors can delete own notices" ON public.notices FOR DELETE TO authenticated USING (
  author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Notice votes policies
CREATE POLICY "Votes are viewable by everyone" ON public.notice_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON public.notice_votes FOR INSERT TO authenticated WITH CHECK (
  profile_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update own votes" ON public.notice_votes FOR UPDATE TO authenticated USING (
  profile_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete own votes" ON public.notice_votes FOR DELETE TO authenticated USING (
  profile_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Flat owners can create comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (
  author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Authors can update own comments" ON public.comments FOR UPDATE TO authenticated USING (
  author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Authors can delete own comments" ON public.comments FOR DELETE TO authenticated USING (
  author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Complaints policies
CREATE POLICY "Complaints are viewable by everyone" ON public.complaints FOR SELECT USING (true);
CREATE POLICY "Flat owners can create complaints" ON public.complaints FOR INSERT TO authenticated WITH CHECK (
  author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Authors can update own complaints" ON public.complaints FOR UPDATE TO authenticated USING (
  author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Complaint reactions policies
CREATE POLICY "Reactions are viewable by everyone" ON public.complaint_reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can react" ON public.complaint_reactions FOR INSERT TO authenticated WITH CHECK (
  profile_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update own reactions" ON public.complaint_reactions FOR UPDATE TO authenticated USING (
  profile_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete own reactions" ON public.complaint_reactions FOR DELETE TO authenticated USING (
  profile_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Polls policies
CREATE POLICY "Polls are viewable by everyone" ON public.polls FOR SELECT USING (true);
CREATE POLICY "Flat owners can create polls" ON public.polls FOR INSERT TO authenticated WITH CHECK (
  author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Poll options policies
CREATE POLICY "Poll options are viewable by everyone" ON public.poll_options FOR SELECT USING (true);
CREATE POLICY "Poll authors can create options" ON public.poll_options FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.polls WHERE id = poll_id AND author_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);

-- Poll votes policies
CREATE POLICY "Poll votes are viewable when poll is closed" ON public.poll_votes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.polls WHERE id = poll_id AND status = 'closed')
);
CREATE POLICY "Flat owners can vote once per poll" ON public.poll_votes FOR INSERT TO authenticated WITH CHECK (
  voter_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add timestamp triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_flats_updated_at BEFORE UPDATE ON public.flats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notices_updated_at BEFORE UPDATE ON public.notices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON public.complaints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial flats for Gokuldham Society
INSERT INTO public.flats (building, flat_number) VALUES
  ('A', '101'), ('A', '102'), ('A', '201'), ('A', '202'), ('A', '301'), ('A', '302'),
  ('B', '101'), ('B', '102'), ('B', '201'), ('B', '202'), ('B', '301'), ('B', '302'),
  ('C', '101'), ('C', '102'), ('C', '201'), ('C', '202'), ('C', '301'), ('C', '302');