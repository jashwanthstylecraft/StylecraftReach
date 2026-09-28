-- Needed so content-capture crons can look up a tracked influencer's Modash profile
alter table influencers add column if not exists modash_user_id text;

-- Captured content (posts, reels, stories)
create table captured_content (
  id uuid default gen_random_uuid() primary key,
  campaign_influencer_id uuid references campaign_influencers(id) on delete set null,
  influencer_id uuid references influencers(id) on delete cascade,
  modash_post_id text unique,
  platform text not null,
  media_type text check (media_type in ('image', 'video', 'reel', 'story', 'carousel', 'short')),
  post_url text not null,
  thumbnail_url text,
  caption text,
  likes integer default 0,
  comments integer default 0,
  views integer default 0,
  shares integer default 0,
  posted_at timestamptz,
  is_story boolean default false,
  expires_at timestamptz,           -- for stories
  captured_at timestamptz default now(),
  -- Sentiment analysis results
  sentiment_score integer,          -- -100 to 100
  overall_sentiment text,
  brand_sentiment text,
  key_themes text[],
  red_flags text[],
  quotable_comment text,
  sentiment_summary text,
  sentiment_analyzed_at timestamptz,
  -- Brand tags
  mentions_brand boolean default false,
  uses_promo_code boolean default false,
  uses_hashtag boolean default false,
  approved_by_brand boolean,
  featured boolean default false     -- pinned to top of library
);

-- Brand mentions (from non-campaign influencers too)
create table brand_mentions (
  id uuid default gen_random_uuid() primary key,
  platform text not null,
  post_url text not null unique,
  author_handle text not null,
  author_followers integer,
  caption text,
  thumbnail_url text,
  likes integer default 0,
  comments integer default 0,
  views integer default 0,
  mention_type text check (mention_type in ('tag', 'hashtag', 'keyword')),
  matched_keyword text,
  sentiment text,
  sentiment_score integer,
  posted_at timestamptz,
  captured_at timestamptz default now(),
  actioned boolean default false,    -- team has seen/actioned it
  action_taken text,                 -- 'replied', 'reposted', 'ignored', 'added_to_crm'
  saved boolean default false
);

-- Tracked hashtags
create table tracked_hashtags (
  id uuid default gen_random_uuid() primary key,
  hashtag text not null unique,       -- without # symbol
  brand text,                         -- Stylecraft / GAMMA+ / Johnny B / competitor
  is_own_brand boolean default true,
  post_count integer default 0,
  weekly_post_count integer default 0,
  total_reach bigint default 0,
  avg_engagement numeric(5,2),
  last_synced_at timestamptz,
  created_at timestamptz default now()
);

-- Competitor influencer overlap
create table competitor_overlap (
  id uuid default gen_random_uuid() primary key,
  influencer_id uuid references influencers(id) on delete cascade,
  competitor_brand text not null,     -- e.g. 'Braun', 'Wahl', 'Andis', 'Philips'
  post_url text,
  post_date date,
  evidence_type text check (evidence_type in ('tag', 'hashtag', 'paid_partnership', 'gifted')),
  notes text,
  alert_enabled boolean default false,
  detected_at timestamptz default now(),
  unique(influencer_id, competitor_brand, post_date)
);

-- Weekly digests
create table intelligence_digests (
  id uuid default gen_random_uuid() primary key,
  week_start date not null unique,
  week_end date not null,
  generated_at timestamptz default now(),
  sent_at timestamptz,
  -- Digest content (Claude-generated)
  headline text,
  executive_summary text,
  top_performing_content jsonb,      -- array of captured_content IDs + stats
  sentiment_overview jsonb,          -- brand sentiment this week
  mention_highlights jsonb,          -- notable organic mentions
  competitor_alerts jsonb,           -- new competitor overlaps
  hashtag_trends jsonb,              -- trending hashtags
  recommended_actions jsonb,         -- Claude-suggested actions
  raw_data jsonb,                    -- all underlying data used
  email_html text                    -- final rendered HTML email
);

-- Indexes
create index on captured_content(influencer_id);
create index on captured_content(posted_at desc);
create index on captured_content(media_type);
create index on brand_mentions(captured_at desc);
create index on brand_mentions(actioned);
create index on competitor_overlap(influencer_id);
