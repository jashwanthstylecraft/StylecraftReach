-- Required so "Add to campaign" can upsert an influencer pulled from Modash
-- (on conflict handle+platform, do update) without creating duplicates.
alter table influencers add constraint influencers_handle_platform_unique unique (handle, platform);

-- Saved/shortlisted creators (before adding to campaign)
create table saved_creators (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,              -- Clerk user ID
  modash_user_id text not null,
  platform text not null,
  handle text not null,
  full_name text,
  profile_pic_url text,
  followers integer,
  engagement_rate numeric(5,2),
  ai_score integer,
  ai_tier text,
  ai_fit_reason text,
  raw_data jsonb,                     -- Full Modash profile stored as JSON
  created_at timestamptz default now(),
  unique(user_id, modash_user_id, platform)
);

-- Search history (for "recent searches" UX)
create table search_history (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  filters jsonb not null,
  result_count integer,
  created_at timestamptz default now()
);

create index saved_creators_user_id_idx on saved_creators(user_id);
create index search_history_user_id_idx on search_history(user_id, created_at desc);
