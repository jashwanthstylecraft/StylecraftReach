-- Tracked hashtags — own brands + competitors
insert into tracked_hashtags (hashtag, brand, is_own_brand) values
  ('gammaplus', 'GAMMA+', true),
  ('gammapro', 'GAMMA+', true),
  ('gammaclippers', 'GAMMA+', true),
  ('johnnybhair', 'Johnny B', true),
  ('johnnybgrooming', 'Johnny B', true),
  ('stylecraftus', 'Stylecraft', true),
  ('braunshaver', 'Braun', false),
  ('braungrooming', 'Braun', false),
  ('wahlamb', 'Wahl', false),
  ('wahlprofessional', 'Wahl', false),
  ('andisclippers', 'Andis', false),
  ('philipsnorelco', 'Philips', false)
on conflict (hashtag) do nothing;

-- Sample captured content for the top two GAMMA+ influencers
insert into captured_content (
  campaign_influencer_id, influencer_id, modash_post_id, platform, media_type, post_url,
  thumbnail_url, caption, likes, comments, views, posted_at, is_story,
  sentiment_score, overall_sentiment, brand_sentiment, key_themes, quotable_comment, sentiment_summary,
  mentions_brand, uses_hashtag, featured
)
select
  ci.id, i.id, seed.modash_post_id, i.platform, seed.media_type, seed.post_url,
  seed.thumbnail_url, seed.caption, seed.likes, seed.comments, seed.views, seed.posted_at::timestamptz, false,
  seed.sentiment_score, seed.overall_sentiment, seed.brand_sentiment, seed.key_themes, seed.quotable_comment,
  seed.sentiment_summary, true, true, seed.featured
from influencers i
join campaign_influencers ci on ci.influencer_id = i.id
join (values
  ('@markthebarbr', 'seed_post_1', 'reel', 'https://instagram.com/reel/seed1', 'https://picsum.photos/seed/cc1/400/400',
   'The battery on this thing is unreal. 3 hours, zero drop-off. #gammaplus', 18400, 1247, 284000, '2026-09-27',
   82, 'positive', 'positive', array['precision','battery life','fade quality'],
   'This clipper changed my life fr fr', 'Audience overwhelmingly positive, barbers responding well to battery life mention', true),
  ('@kingcuts', 'seed_post_2', 'video', 'https://tiktok.com/@kingcuts/video/seed2', 'https://picsum.photos/seed/cc2/400/400',
   'zero-gap adjustment on the new GAMMA+ Pro is actually insane', 9200, 340, 156000, '2026-09-25',
   61, 'positive', 'positive', array['zero-gap','precision'],
   'been using wahl for 10 years and this might replace it', 'Positive reception, some cross-brand comparison to Wahl in comments', true)
) as seed(handle, modash_post_id, media_type, post_url, thumbnail_url, caption, likes, comments, views, posted_at,
          sentiment_score, overall_sentiment, brand_sentiment, key_themes, quotable_comment, sentiment_summary, featured)
  on seed.handle = i.handle
on conflict (modash_post_id) do nothing;

-- Sample organic brand mentions (not from tracked campaign influencers)
insert into brand_mentions (
  platform, post_url, author_handle, author_followers, caption, thumbnail_url,
  likes, comments, views, mention_type, matched_keyword, sentiment, sentiment_score, posted_at
) values
  ('instagram', 'https://instagram.com/p/mention1', '@barbernamedmike', 12400,
   'Just tried the GAMMA+ pro clipper and honestly wasn''t expecting much but wow', 'https://picsum.photos/seed/bm1/400/400',
   847, 94, 12400, 'tag', '@gammaplus_official', 'positive', 74, now() - interval '2 hours'),
  ('tiktok', 'https://tiktok.com/@fadecheck/video/mention2', '@fadecheck', 68000,
   'ranking every clipper brand for 2026 — gamma pro landed top 3', 'https://picsum.photos/seed/bm2/400/400',
   3200, 210, 89000, 'hashtag', '#gammaplus', 'positive', 68, now() - interval '1 day')
on conflict (post_url) do nothing;

-- Sample competitor overlap
insert into competitor_overlap (influencer_id, competitor_brand, post_url, post_date, evidence_type, notes)
select i.id, 'Wahl', 'https://instagram.com/p/overlap1', '2026-09-15', 'hashtag', 'Posted #wahlamb content while active on GAMMA+ Launch'
from influencers i where i.handle = '@markthebarbr'
on conflict (influencer_id, competitor_brand, post_date) do nothing;

insert into competitor_overlap (influencer_id, competitor_brand, post_url, post_date, evidence_type, notes)
select i.id, 'Braun', 'https://instagram.com/p/overlap2', '2026-09-20', 'paid_partnership', 'Sponsored post tag #ad detected'
from influencers i where i.handle = '@fademaster'
on conflict (influencer_id, competitor_brand, post_date) do nothing;
