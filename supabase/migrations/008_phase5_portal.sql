-- Influencer invitations
create table influencer_invitations (
  id uuid default gen_random_uuid() primary key,
  influencer_id uuid references influencers(id) on delete cascade,
  clerk_invitation_id text,
  clerk_user_id text,            -- filled when they accept
  email text not null,
  status text default 'pending' check (status in ('pending', 'accepted', 'expired')),
  accepted_at timestamptz,
  created_at timestamptz default now()
);

-- Content submissions
create table content_submissions (
  id uuid default gen_random_uuid() primary key,
  deliverable_id uuid references deliverables(id) on delete cascade,
  campaign_influencer_id uuid references campaign_influencers(id) on delete cascade,
  submitted_url text,            -- uploaded file URL or social post URL
  caption text,
  notes text,
  status text default 'pending_review' check (status in (
    'pending_review', 'approved', 'needs_revision', 'rejected'
  )),
  feedback text,                 -- brand's feedback on rejection/revision
  reviewed_by text,              -- Clerk user ID of brand reviewer
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

-- Portal messages (influencer <-> brand thread per campaign)
create table portal_messages (
  id uuid default gen_random_uuid() primary key,
  campaign_influencer_id uuid references campaign_influencers(id) on delete cascade,
  sender_role text not null check (sender_role in ('brand', 'influencer')),
  sender_id text not null,       -- Clerk user ID
  sender_name text not null,
  content text not null,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- Notification preferences
create table influencer_notifications (
  id uuid default gen_random_uuid() primary key,
  influencer_id uuid references influencers(id) on delete cascade unique,
  email_on_payment boolean default true,
  email_on_approval boolean default true,
  email_on_deliverable boolean default true,
  whatsapp_number text,
  whatsapp_enabled boolean default false,
  updated_at timestamptz default now()
);

-- Links a Clerk portal account to its influencers row
alter table influencers add column if not exists clerk_user_id text unique;

create index on content_submissions(campaign_influencer_id);
create index on content_submissions(deliverable_id);
create index on portal_messages(campaign_influencer_id);
create index on influencer_invitations(influencer_id);

-- Note: this app authenticates via Clerk, not Supabase Auth, so auth.uid()
-- (used below) is never populated — every Supabase read/write goes through
-- the service-role client (lib/supabase/server.ts), which bypasses RLS
-- entirely regardless of these policies. They're included per the brief for
-- documentation/defense-in-depth, but the real access control for portal
-- data isolation is application-layer: every portal query is filtered by
-- the signed-in influencer's clerk_user_id in code (lib/portal-data.ts),
-- not by Postgres RLS.
alter table campaign_influencers enable row level security;
create policy "Influencers see own campaigns"
  on campaign_influencers for select
  using (
    influencer_id in (
      select id from influencers where clerk_user_id = auth.uid()::text
    )
  );

alter table content_submissions enable row level security;
create policy "Influencers see own submissions"
  on content_submissions for select
  using (
    campaign_influencer_id in (
      select ci.id from campaign_influencers ci
      join influencers i on ci.influencer_id = i.id
      where i.clerk_user_id = auth.uid()::text
    )
  );
