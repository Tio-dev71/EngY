-- EngY Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─── Enums ───────────────────────────────────────────
create type track_type as enum ('toeic', 'medical');
create type subscription_tier as enum ('free', 'pro');
create type game_type as enum ('flashcard_match', 'multiple_choice', 'fill_blank', 'word_scramble');
create type difficulty_level as enum ('beginner', 'intermediate', 'advanced');

-- ─── Profiles ────────────────────────────────────────
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null default '',
  avatar_url text,
  track_type track_type not null default 'toeic',
  level difficulty_level not null default 'beginner',
  xp_total integer not null default 0,
  streak_days integer not null default 0,
  last_active_at timestamptz not null default now(),
  preferred_language text not null default 'vi' check (preferred_language in ('vi', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Subscriptions ───────────────────────────────────
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  tier subscription_tier not null default 'free',
  trial_ends_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id)
);

-- ─── Lessons ─────────────────────────────────────────
create table lessons (
  id text primary key,
  track_type track_type not null,
  title_vi text not null,
  title_en text not null,
  description_vi text not null default '',
  description_en text not null default '',
  difficulty difficulty_level not null default 'beginner',
  order_index integer not null default 0,
  is_pro boolean not null default false,
  xp_reward integer not null default 50,
  estimated_minutes integer not null default 15,
  icon text not null default '📚',
  created_at timestamptz not null default now()
);

-- ─── Vocabularies ────────────────────────────────────
create table vocabularies (
  id uuid primary key default uuid_generate_v4(),
  lesson_id text references lessons(id) on delete cascade not null,
  word text not null,
  phonetic text not null default '',
  meaning_vi text not null,
  meaning_en text not null,
  example_sentence text not null default '',
  example_translation text not null default '',
  part_of_speech text not null default 'noun',
  audio_url text,
  image_url text,
  difficulty difficulty_level not null default 'beginner',
  track_type track_type not null,
  created_at timestamptz not null default now()
);

-- ─── User Progress ───────────────────────────────────
create table user_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  lesson_id text references lessons(id) on delete cascade not null,
  completed boolean not null default false,
  score integer not null default 0,
  time_spent_seconds integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

-- ─── User Vocab Mastery (SRS) ────────────────────────
create table user_vocab_mastery (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  vocabulary_id uuid references vocabularies(id) on delete cascade not null,
  mastery_level integer not null default 0 check (mastery_level >= 0 and mastery_level <= 5),
  correct_count integer not null default 0,
  incorrect_count integer not null default 0,
  next_review_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  ease_factor numeric(4,2) not null default 2.50,
  interval_days integer not null default 0,
  created_at timestamptz not null default now(),
  unique(user_id, vocabulary_id)
);

-- ─── Notes ───────────────────────────────────────────
create table notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  lesson_id text references lessons(id) on delete set null,
  vocabulary_id uuid references vocabularies(id) on delete set null,
  content text not null default '',
  color text not null default '#a7f3d0',
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Game Scores ─────────────────────────────────────
create table game_scores (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  lesson_id text references lessons(id) on delete cascade not null,
  game_type game_type not null,
  score integer not null default 0,
  max_score integer not null default 0,
  time_spent_seconds integer not null default 0,
  xp_earned integer not null default 0,
  played_at timestamptz not null default now()
);

-- ─── Achievements ────────────────────────────────────
create table achievements (
  id uuid primary key default uuid_generate_v4(),
  name_vi text not null,
  name_en text not null,
  description_vi text not null,
  description_en text not null,
  icon text not null default '🏆',
  xp_reward integer not null default 0,
  condition_type text not null,
  condition_value integer not null default 0,
  created_at timestamptz not null default now()
);

-- ─── User Achievements ──────────────────────────────
create table user_achievements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  achievement_id uuid references achievements(id) on delete cascade not null,
  unlocked_at timestamptz not null default now(),
  unique(user_id, achievement_id)
);

-- ─── Row Level Security ──────────────────────────────
alter table profiles enable row level security;
alter table subscriptions enable row level security;
alter table user_progress enable row level security;
alter table user_vocab_mastery enable row level security;
alter table notes enable row level security;
alter table game_scores enable row level security;
alter table user_achievements enable row level security;

-- Profiles: users can read/update their own profile
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Subscriptions
create policy "Users can view own subscription" on subscriptions for select using (auth.uid() = user_id);
create policy "Users can insert own subscription" on subscriptions for insert with check (auth.uid() = user_id);
create policy "Users can update own subscription" on subscriptions for update using (auth.uid() = user_id);

-- Lessons & Vocabularies: public read
alter table lessons enable row level security;
create policy "Lessons are publicly readable" on lessons for select using (true);
alter table vocabularies enable row level security;
create policy "Vocabularies are publicly readable" on vocabularies for select using (true);

-- Achievements: public read
alter table achievements enable row level security;
create policy "Achievements are publicly readable" on achievements for select using (true);

-- User data policies
create policy "Users can manage own progress" on user_progress for all using (auth.uid() = user_id);
create policy "Users can manage own mastery" on user_vocab_mastery for all using (auth.uid() = user_id);
create policy "Users can manage own notes" on notes for all using (auth.uid() = user_id);
create policy "Users can manage own scores" on game_scores for all using (auth.uid() = user_id);
create policy "Users can manage own achievements" on user_achievements for all using (auth.uid() = user_id);

-- ─── Trigger: auto-create profile on signup ──────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  
  -- Create free subscription with 7-day trial
  insert into public.subscriptions (user_id, tier, trial_ends_at)
  values (new.id, 'free', now() + interval '7 days');
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Trigger: update updated_at ──────────────────────
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute procedure public.update_updated_at();

create trigger notes_updated_at
  before update on notes
  for each row execute procedure public.update_updated_at();

-- ─── Indexes ─────────────────────────────────────────
create index idx_vocabularies_lesson on vocabularies(lesson_id);
create index idx_vocabularies_track on vocabularies(track_type);
create index idx_user_progress_user on user_progress(user_id);
create index idx_user_vocab_mastery_user on user_vocab_mastery(user_id);
create index idx_user_vocab_mastery_next_review on user_vocab_mastery(next_review_at);
create index idx_notes_user on notes(user_id);
create index idx_game_scores_user on game_scores(user_id);
create index idx_lessons_track on lessons(track_type);
