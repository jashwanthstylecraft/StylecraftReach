-- Sample promo codes (link to existing campaign_influencer rows)
insert into promo_codes (campaign_influencer_id, code, discount_type, discount_value, commission_rate, usage_count)
select id, 'MARK15', 'percentage', 15, 10, 142
from campaign_influencers
order by created_at
limit 1;

insert into promo_codes (campaign_influencer_id, code, discount_type, discount_value, commission_rate, usage_count)
select id, 'KING20', 'percentage', 20, 12, 87
from campaign_influencers
order by created_at
offset 1 limit 1;

-- Sample affiliate links for the first three campaign_influencer rows
insert into affiliate_links (campaign_influencer_id, dub_link_id, short_link, destination_url, clicks, conversions, revenue, last_synced_at)
select ci.id, links.dub_link_id, links.short_link, links.destination_url, links.clicks, links.conversions, links.revenue, now()
from campaign_influencers ci
join (
  select row_number() over (order by created_at) as rn, id from campaign_influencers order by created_at limit 3
) ranked on ranked.id = ci.id
join (values
  (1, 'dub_mock_seed_1', 'https://screach.link/mark-gamma', 'https://stylecraftus.com/products/gamma-pro', 4821, 142, 7384.00),
  (2, 'dub_mock_seed_2', 'https://screach.link/king-gamma', 'https://stylecraftus.com/products/gamma-pro', 3190, 87, 4310.50),
  (3, 'dub_mock_seed_3', 'https://screach.link/bruno-johnnyb', 'https://stylecraftus.com/products/johnny-b', 980, 21, 985.00)
) as links(rn, dub_link_id, short_link, destination_url, clicks, conversions, revenue) on links.rn = ranked.rn;

-- Sample conversions for the first influencer/promo code (MARK15)
insert into conversions (campaign_influencer_id, promo_code_id, affiliate_link_id, order_id, order_amount, commission_amount, commission_paid, customer_id, source)
select
  ci.id,
  pc.id,
  al.id,
  'SC-' || (4800 + s.n),
  round((30 + random() * 60)::numeric, 2),
  round(((30 + random() * 60) * 0.10)::numeric, 2),
  s.n < 5,
  'cust_' || s.n,
  'promo_code'
from campaign_influencers ci
join promo_codes pc on pc.campaign_influencer_id = ci.id and pc.code = 'MARK15'
join affiliate_links al on al.campaign_influencer_id = ci.id
cross join generate_series(1, 8) as s(n)
order by ci.created_at
limit 8;

-- Daily stats (last 14 days) for the first three campaign_influencer rows
insert into daily_stats (campaign_influencer_id, date, clicks, conversions, revenue, commission_amount)
select
  ranked.id,
  current_date - (d.n * interval '1 day'),
  floor(random() * scale.clicks_scale + 30)::int,
  floor(random() * scale.conv_scale + 3)::int,
  (random() * scale.revenue_scale + 100)::numeric(10,2),
  (random() * scale.revenue_scale * 0.1 + 10)::numeric(10,2)
from (
  select row_number() over (order by created_at) as rn, id from campaign_influencers order by created_at limit 3
) ranked
cross join generate_series(0, 13) as d(n)
join (values (1, 200, 20, 900), (2, 140, 12, 600), (3, 60, 5, 250)) as scale(rn, clicks_scale, conv_scale, revenue_scale)
  on scale.rn = ranked.rn;
