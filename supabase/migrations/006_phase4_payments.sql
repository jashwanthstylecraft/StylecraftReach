-- Stripe Connect account per influencer
alter table influencers add column if not exists stripe_account_id text;
alter table influencers add column if not exists stripe_onboarded boolean default false;
alter table influencers add column if not exists stripe_onboarded_at timestamptz;

-- Payments (one row per payout sent)
create table payments (
  id uuid default gen_random_uuid() primary key,
  campaign_influencer_id uuid references campaign_influencers(id) on delete cascade,
  payment_type text not null check (payment_type in ('flat_fee', 'commission', 'bonus')),
  amount numeric(10,2) not null,
  currency text default 'usd',
  status text default 'pending' check (status in ('pending', 'processing', 'paid', 'failed', 'cancelled')),
  stripe_transfer_id text,
  stripe_account_id text,
  description text,
  period_start date,             -- for commission payments: date range covered
  period_end date,
  invoice_id uuid,               -- reference to invoices table
  paid_at timestamptz,
  failed_reason text,
  created_at timestamptz default now()
);

-- Invoices
create table invoices (
  id uuid default gen_random_uuid() primary key,
  payment_id uuid references payments(id) on delete cascade,
  invoice_number text not null unique,   -- e.g. SCR-2026-0042
  influencer_id uuid references influencers(id),
  campaign_id uuid references campaigns(id),
  amount numeric(10,2) not null,
  currency text default 'usd',
  description text,
  line_items jsonb,              -- array of {description, amount} objects
  pdf_url text,                  -- Supabase storage URL of generated PDF
  issued_at timestamptz default now(),
  due_at timestamptz
);

-- Payment schedule (planned future payments)
create table payment_schedule (
  id uuid default gen_random_uuid() primary key,
  campaign_influencer_id uuid references campaign_influencers(id) on delete cascade,
  payment_type text not null check (payment_type in ('flat_fee', 'commission', 'bonus')),
  amount numeric(10,2),          -- null for commission (auto-calculated)
  scheduled_date date not null,
  status text default 'scheduled' check (status in ('scheduled', 'processing', 'paid', 'cancelled')),
  notes text,
  created_at timestamptz default now()
);

-- Indexes
create index on payments(campaign_influencer_id);
create index on payments(status);
create index on payments(created_at);
create index on invoices(influencer_id);

-- Storage bucket for invoice PDFs
insert into storage.buckets (id, name, public)
values ('stylecraftreach', 'stylecraftreach', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload invoices"
on storage.objects for insert
to authenticated
with check (bucket_id = 'stylecraftreach');

create policy "Public can read invoices"
on storage.objects for select
to public
using (bucket_id = 'stylecraftreach');
