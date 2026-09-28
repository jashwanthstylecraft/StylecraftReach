-- Campaigns table
create table campaigns (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  brand text not null check (brand in ('Stylecraft', 'GAMMA+', 'Johnny B')),
  status text default 'active' check (status in ('draft', 'active', 'completed', 'paused')),
  budget numeric(10,2),
  spend numeric(10,2) default 0,
  start_date date,
  end_date date,
  brief text,
  created_at timestamptz default now()
);

-- Influencers table
create table influencers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  handle text not null,
  platform text not null check (platform in ('Instagram', 'TikTok', 'YouTube', 'X')),
  followers integer,
  engagement_rate numeric(5,2),
  email text,
  location text,
  niche text,
  avatar_url text,
  ai_score integer check (ai_score between 0 and 100),
  notes text,
  created_at timestamptz default now()
);

-- Campaign influencers (junction table with pipeline stage)
create table campaign_influencers (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references campaigns(id) on delete cascade,
  influencer_id uuid references influencers(id) on delete cascade,
  stage text default 'Shortlisted' check (stage in ('Shortlisted', 'Outreach sent', 'Negotiating', 'Active', 'Completed')),
  fee numeric(10,2),
  commission_rate numeric(5,2),
  affiliate_code text,
  affiliate_link text,
  stage_updated_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(campaign_id, influencer_id)
);

-- Communication log
create table communications (
  id uuid default gen_random_uuid() primary key,
  campaign_influencer_id uuid references campaign_influencers(id) on delete cascade,
  type text check (type in ('note', 'email', 'dm', 'call')),
  content text not null,
  created_by text,
  created_at timestamptz default now()
);

-- Deliverables
create table deliverables (
  id uuid default gen_random_uuid() primary key,
  campaign_influencer_id uuid references campaign_influencers(id) on delete cascade,
  description text not null,
  due_date date,
  completed boolean default false,
  content_url text,
  created_at timestamptz default now()
);

-- Gifting / product seeding
create table gifts (
  id uuid default gen_random_uuid() primary key,
  campaign_influencer_id uuid references campaign_influencers(id) on delete cascade,
  product_name text not null,
  tracking_number text,
  shipped_date date,
  delivered boolean default false,
  created_at timestamptz default now()
);

create index campaign_influencers_campaign_id_idx on campaign_influencers(campaign_id);
create index campaign_influencers_influencer_id_idx on campaign_influencers(influencer_id);
create index communications_campaign_influencer_id_idx on communications(campaign_influencer_id);
create index deliverables_campaign_influencer_id_idx on deliverables(campaign_influencer_id);
create index gifts_campaign_influencer_id_idx on gifts(campaign_influencer_id);
