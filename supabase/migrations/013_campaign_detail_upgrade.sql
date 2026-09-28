-- Affable-style campaign detail page: adds a display status override (independent
-- of the Kanban `stage` pipeline, which stays the source of truth for the board)
-- and a free-text assignee. No Clerk Organizations exist in this app, so
-- "assignee" is a plain name/email rather than a picker over team members.
alter table campaign_influencers add column if not exists status text
  check (status in ('Invited','Accepted','Declined','Active','Published','Completed'));
alter table campaign_influencers add column if not exists assignee_name text;

-- Proposals — a deliverables-and-fee offer sent to a campaign influencer, tracked
-- separately from the Kanban stage so multiple proposals/revisions can exist.
create table if not exists proposals (
  id uuid default gen_random_uuid() primary key,
  campaign_influencer_id uuid references campaign_influencers(id) on delete cascade,
  deliverables jsonb default '[]',   -- [{type, quantity, deadline, notes}]
  fee numeric(10,2),
  notes text,
  status text default 'draft' check (status in ('draft','sent','accepted','declined')),
  sent_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz default now()
);

-- Creator portal settings per campaign — what the influencer sees when they open
-- this campaign inside /portal, and a welcome message shown on first visit.
create table if not exists creator_portal_settings (
  id uuid default gen_random_uuid() primary key,
  campaign_id uuid references campaigns(id) on delete cascade unique,
  show_brief boolean default true,
  show_deliverables boolean default true,
  show_gifting boolean default true,
  show_earnings boolean default true,
  show_other_influencers boolean default false,
  welcome_message text,
  created_at timestamptz default now()
);

-- Bulk "Send mails" log — no email provider is wired up yet (see
-- lib/campaign-emails-actions.ts), so this is an honest audit trail of what
-- WOULD have been sent, not proof of delivery.
create table if not exists campaign_emails_sent (
  id uuid default gen_random_uuid() primary key,
  campaign_influencer_id uuid references campaign_influencers(id) on delete cascade,
  template text not null check (template in ('invitation','reminder','custom')),
  subject text not null,
  body text not null,
  sent_by text,
  delivered boolean default false,   -- true only if a real provider confirmed delivery
  created_at timestamptz default now()
);

-- Saved Brand Comparison trends dashboards
create table if not exists saved_dashboards (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  filters jsonb not null,
  created_by text,
  created_at timestamptz default now()
);

-- Campaign-scoped reports (nullable — a report can still be global/cross-campaign)
alter table reports add column if not exists campaign_id uuid references campaigns(id) on delete set null;

-- Campaign summary view — backs the 7 stat cards on /campaigns/[id]. Computed live
-- rather than as denormalized columns on `campaigns`, so it never goes stale and
-- needs no recompute job. Influencer/follower totals and content totals are
-- aggregated in separate subqueries before joining, so a campaign with multiple
-- content pieces per influencer doesn't fan-out and double-count followers.
create or replace view campaign_summary as
select
  c.id as campaign_id,
  coalesce(inf.influencer_count, 0) as influencer_count,
  coalesce(content.video_count, 0) as video_count,
  coalesce(content.image_count, 0) as image_count,
  coalesce(content.total_likes, 0) as total_likes,
  coalesce(content.total_comments, 0) as total_comments,
  coalesce(content.total_views, 0) as total_views,
  coalesce(content.avg_engagement, 0) as avg_engagement,
  coalesce(inf.total_followers, 0) * 0.1 as est_reach,
  coalesce(inf.total_followers, 0) * 0.15 as est_impressions,
  coalesce(content.total_emv, 0) as est_emv
from campaigns c
left join (
  select
    ci.campaign_id,
    count(distinct ci.influencer_id) as influencer_count,
    sum(i.followers) as total_followers
  from campaign_influencers ci
  join influencers i on i.id = ci.influencer_id
  group by ci.campaign_id
) inf on inf.campaign_id = c.id
left join (
  select
    ci.campaign_id,
    sum(case when cc.media_type in ('video', 'reel', 'short') then 1 else 0 end) as video_count,
    sum(case when cc.media_type in ('image', 'carousel') then 1 else 0 end) as image_count,
    sum(cc.likes) as total_likes,
    sum(cc.comments) as total_comments,
    sum(cc.views) as total_views,
    avg(case when i.followers > 0 then (cc.likes::numeric / i.followers * 100) end) as avg_engagement,
    sum(cc.emv) as total_emv
  from captured_content cc
  join campaign_influencers ci on ci.id = cc.campaign_influencer_id
  join influencers i on i.id = ci.influencer_id
  group by ci.campaign_id
) content on content.campaign_id = c.id;
