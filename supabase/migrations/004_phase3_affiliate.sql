-- Affiliate links (mirrors Dub.co data locally for fast queries)
create table affiliate_links (
  id uuid default gen_random_uuid() primary key,
  campaign_influencer_id uuid references campaign_influencers(id) on delete cascade,
  dub_link_id text not null unique,
  short_link text not null,
  destination_url text not null,
  clicks integer default 0,
  conversions integer default 0,
  revenue numeric(10,2) default 0,
  last_synced_at timestamptz,
  created_at timestamptz default now()
);

-- Promo codes
create table promo_codes (
  id uuid default gen_random_uuid() primary key,
  campaign_influencer_id uuid references campaign_influencers(id) on delete cascade,
  code text not null unique,
  discount_type text check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(10,2) not null,
  commission_rate numeric(5,2) default 10,   -- % of sale paid to influencer
  usage_count integer default 0,
  usage_limit integer,                        -- null = unlimited
  expires_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Individual conversions (orders attributed to an influencer)
create table conversions (
  id uuid default gen_random_uuid() primary key,
  campaign_influencer_id uuid references campaign_influencers(id) on delete cascade,
  promo_code_id uuid references promo_codes(id),
  affiliate_link_id uuid references affiliate_links(id),
  order_id text not null unique,
  order_amount numeric(10,2) not null,
  commission_amount numeric(10,2) not null,
  commission_paid boolean default false,
  commission_paid_at timestamptz,
  customer_id text,
  source text check (source in ('promo_code', 'affiliate_link', 'both')),
  created_at timestamptz default now()
);

-- Daily stats snapshot (for fast chart queries — avoids re-aggregating)
create table daily_stats (
  id uuid default gen_random_uuid() primary key,
  campaign_influencer_id uuid references campaign_influencers(id) on delete cascade,
  date date not null,
  clicks integer default 0,
  conversions integer default 0,
  revenue numeric(10,2) default 0,
  commission_amount numeric(10,2) default 0,
  created_at timestamptz default now(),
  unique(campaign_influencer_id, date)
);

-- Indexes for fast dashboard queries
create index on conversions(campaign_influencer_id);
create index on conversions(created_at);
create index on daily_stats(date);
create index on affiliate_links(campaign_influencer_id);
