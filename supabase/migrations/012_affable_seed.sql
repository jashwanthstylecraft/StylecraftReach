-- Real hashtags seen in the Affable.ai account
insert into tracked_hashtags (hashtag, brand, is_own_brand) values
  ('stylecraftpro', 'Stylecraft', true),
  ('acebodybuzzer', 'Stylecraft', true),
  ('manscaped', 'Stylecraft', true),
  ('mensshaver', 'Stylecraft', true),
  ('electricshaver', 'Stylecraft', true),
  ('instinctshaver', 'Stylecraft', true),
  ('stylecraftinstinctshaver', 'Stylecraft', true),
  ('hairtrimmer', 'Stylecraft', true),
  ('stylecraftinstincttrimmer', 'Stylecraft', true),
  ('gammaplusna', 'GAMMA+', true),
  ('gammaplus', 'GAMMA+', true),
  ('gamma', 'GAMMA+', true),
  ('stylecraftus', 'Stylecraft', true)
on conflict (hashtag) do nothing;

-- Real campaign names from the Affable.ai account
insert into campaigns (name, brand, status, tracked_hashtags, tracked_mentions, budget_label) values
  ('Ace Body Buzzer Video', 'Stylecraft', 'active',
   array['stylecraftpro','acebodybuzzer','manscaped'], array['stylecraftpro'], '$100'),
  ('Ace Shaver Video', 'Stylecraft', 'active',
   array['stylecraftpro','mensshaver','electricshaver'], array['stylecraftpro'], '$100'),
  ('Instinct Shaver Video', 'Stylecraft', 'active',
   array['stylecraftpro','instinctshaver','stylecraftinstinctshaver'], array['stylecraftpro'], '$100'),
  ('Instinct Trimmer Video', 'Stylecraft', 'active',
   array['hairtrimmer','stylecraftpro','stylecraftinstincttrimmer'], array['stylecraftpro'], '$100'),
  ('Boosted Up Video', 'GAMMA+', 'active',
   array['gammaplusna','gammaplus','gamma'], array['gammaplusna'], '$100'),
  ('Active Beauty Influencers - INSTAGRAM', 'Stylecraft', 'active',
   array['stylecraft','stylecraftpro','stylecraftus'], array['gammaplusna','stylecraftpro'], null)
on conflict do nothing;

-- Backfill tracked hashtags/mentions on the Phase 1 seed campaigns too, matching
-- the real per-brand hashtag sets above (these campaigns already exist from
-- 002_seed_data.sql — this only adds the new columns' values, nothing else changes)
update campaigns set
  tracked_hashtags = array['gammaplusna','gammaplus','gamma'],
  tracked_mentions = array['gammaplusna']
where brand = 'GAMMA+' and tracked_hashtags = '{}';

update campaigns set
  tracked_hashtags = array['johnnybhair','johnnybgrooming'],
  tracked_mentions = array['johnnybhair']
where brand = 'Johnny B' and tracked_hashtags = '{}';

update campaigns set
  tracked_hashtags = array['stylecraftpro','stylecraftus'],
  tracked_mentions = array['stylecraftpro']
where brand = 'Stylecraft' and tracked_hashtags = '{}';
