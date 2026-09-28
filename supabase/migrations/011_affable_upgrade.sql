-- EMV (Earned Media Value)
alter table captured_content add column if not exists emv numeric(12,2);
alter table brand_mentions add column if not exists emv numeric(12,2);

update captured_content set emv = (likes * 0.01) + (comments * 0.10) + (views * 0.003) + (shares * 0.05)
where emv is null;
update brand_mentions set emv = (likes * 0.01) + (comments * 0.10) + (views * 0.003)
where emv is null;

-- Campaign fields matching Affable's campaign cards
alter table campaigns add column if not exists tracked_hashtags text[] default '{}';
alter table campaigns add column if not exists tracked_mentions text[] default '{}';
alter table campaigns add column if not exists budget_label text;

-- Reports — saved, named, dated views of influencer content
create table reports (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  platform text not null check (platform in ('instagram', 'tiktok', 'youtube', 'all')),
  filters jsonb,                    -- saved filter state
  influencer_ids uuid[] default '{}',
  post_ids uuid[] default '{}',
  post_count integer default 0,
  created_by text,                  -- Clerk user ID
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Community — creator lists (a lighter-weight grouping than a campaign)
create table community_lists (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  influencer_ids uuid[] default '{}',
  created_by text,
  created_at timestamptz default now()
);

-- Social account connections (brand's own Instagram/TikTok/YouTube — OAuth stubbed
-- until real app credentials exist, see lib/social/client.ts)
create table social_connections (
  id uuid default gen_random_uuid() primary key,
  workspace_id text not null,           -- brand's workspace (Clerk org id, or 'default' for now)
  platform text not null check (platform in ('instagram', 'tiktok', 'youtube')),
  account_id text not null,             -- platform's account ID
  account_name text,                    -- display name e.g. "@gammaplusna"
  access_token text,                    -- encrypted at rest by the app layer, not by Postgres
  refresh_token text,
  token_expires_at timestamptz,
  followers integer,
  is_active boolean default true,
  connected_at timestamptz default now(),
  last_synced_at timestamptz,
  unique(workspace_id, platform, account_id)
);

create index on reports(created_at desc);
create index on community_lists(created_at desc);
