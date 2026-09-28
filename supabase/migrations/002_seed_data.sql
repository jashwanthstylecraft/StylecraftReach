-- Campaigns
insert into campaigns (name, brand, status, budget, spend, start_date, end_date, brief) values
  ('GAMMA+ Pro Launch', 'GAMMA+', 'active', 5000, 1850, '2026-09-01', '2026-11-15', 'Launch campaign for the GAMMA+ Pro line — barbering and grooming creators.'),
  ('Johnny B Holiday Push', 'Johnny B', 'active', 3500, 900, '2026-10-01', '2026-12-31', 'Holiday gifting push across grooming and lifestyle creators.'),
  ('Stylecraft Back-to-School', 'Stylecraft', 'completed', 4000, 3960, '2026-07-15', '2026-08-31', 'Back-to-school styling campaign, wrapped.');

-- Influencers
insert into influencers (name, handle, platform, followers, engagement_rate, email, location, niche, ai_score, notes) values
  ('Mark the Barber', '@markthebarbr', 'Instagram', 284000, 4.80, 'mark@markthebarbr.com', 'Los Angeles, CA', 'Barbering', 96, 'Top performer, worked with us before.'),
  ('King Cuts', '@kingcuts', 'TikTok', 1200000, 6.10, 'king@kingcuts.io', 'Atlanta, GA', 'Grooming', 91, 'Huge reach, in active negotiation on fee.'),
  ('Styles by Bruno', '@stylesbybruno', 'YouTube', 98000, 3.20, 'bruno@stylesbybruno.com', 'Miami, FL', 'Hair styling', 78, null),
  ('The Grooming Co', '@thegroommingco', 'Instagram', 67000, 2.90, 'hello@thegroommingco.com', 'Chicago, IL', 'Grooming', 71, null),
  ('Fade Master', '@fademaster', 'TikTok', 445000, 5.40, 'fademaster@gmail.com', 'Houston, TX', 'Barbering', 88, 'Delivering strong engagement on Reels.'),
  ('Sharp Cuts NYC', '@sharpcuts_nyc', 'Instagram', 123000, 3.70, 'contact@sharpcutsnyc.com', 'New York, NY', 'Barbering', 82, 'Completed back-to-school campaign, great results.'),
  ('Groom With Me', '@groomwithme', 'YouTube', 54000, 2.40, 'groomwithme@gmail.com', 'Denver, CO', 'Lifestyle grooming', 65, null),
  ('Blade and Brush', '@bladeandbrush', 'Instagram', 89000, 3.10, 'bladeandbrush@gmail.com', 'Austin, TX', 'Classic grooming', 74, 'Completed back-to-school campaign.'),
  ('The Creative Clip', '@thecreativeclip', 'TikTok', 234000, 4.60, 'creativeclip@gmail.com', 'Portland, OR', 'Hair art', 69, null),
  ('Barberlife Official', '@barberlife_official', 'Instagram', 312000, 5.00, 'barberlife@gmail.com', 'Philadelphia, PA', 'Barbering', 93, 'Negotiating fee for holiday push.');

-- Campaign <-> influencer pipeline placements
insert into campaign_influencers (campaign_id, influencer_id, stage, fee, commission_rate, affiliate_code)
select c.id, i.id, x.stage, x.fee, x.commission_rate, x.affiliate_code
from (values
  ('GAMMA+ Pro Launch', '@markthebarbr', 'Active', 1200.00, 10.00, 'MARK10'),
  ('GAMMA+ Pro Launch', '@kingcuts', 'Negotiating', 2000.00, 12.00, null),
  ('GAMMA+ Pro Launch', '@fademaster', 'Active', 900.00, 10.00, 'FADE10'),
  ('GAMMA+ Pro Launch', '@thecreativeclip', 'Outreach sent', null, null, null),
  ('Johnny B Holiday Push', '@stylesbybruno', 'Outreach sent', null, null, null),
  ('Johnny B Holiday Push', '@thegroommingco', 'Shortlisted', null, null, null),
  ('Johnny B Holiday Push', '@groomwithme', 'Shortlisted', null, null, null),
  ('Johnny B Holiday Push', '@barberlife_official', 'Negotiating', 1500.00, 10.00, null),
  ('Stylecraft Back-to-School', '@sharpcuts_nyc', 'Completed', 800.00, 8.00, 'SHARP8'),
  ('Stylecraft Back-to-School', '@bladeandbrush', 'Completed', 700.00, 8.00, 'BLADE8')
) as x(campaign_name, handle, stage, fee, commission_rate, affiliate_code)
join campaigns c on c.name = x.campaign_name
join influencers i on i.handle = x.handle;

-- Sample communications, deliverables, and gifts for the active/completed placements
insert into communications (campaign_influencer_id, type, content, created_by)
select ci.id, 'email', 'Sent initial outreach with campaign brief and rate card.', 'jashwanthd@stylecraftus.com'
from campaign_influencers ci
join influencers i on i.id = ci.influencer_id
where i.handle = '@markthebarbr';

insert into communications (campaign_influencer_id, type, content, created_by)
select ci.id, 'note', 'Agreed on $1200 flat fee + 10% commission. Contract sent.', 'jashwanthd@stylecraftus.com'
from campaign_influencers ci
join influencers i on i.id = ci.influencer_id
where i.handle = '@markthebarbr';

insert into deliverables (campaign_influencer_id, description, due_date, completed)
select ci.id, d.description, d.due_date::date, d.completed
from campaign_influencers ci
join influencers i on i.id = ci.influencer_id
join (values
  ('@markthebarbr', '1x Reel', '2026-10-10', true),
  ('@markthebarbr', '3x Stories', '2026-10-12', false),
  ('@fademaster', '1x Feed post', '2026-10-20', false),
  ('@sharpcuts_nyc', '1x Reel', '2026-08-15', true),
  ('@bladeandbrush', '1x Feed post', '2026-08-20', true)
) as d(handle, description, due_date, completed) on d.handle = i.handle;

insert into gifts (campaign_influencer_id, product_name, tracking_number, shipped_date, delivered)
select ci.id, g.product_name, g.tracking_number, g.shipped_date::date, g.delivered
from campaign_influencers ci
join influencers i on i.id = ci.influencer_id
join (values
  ('@markthebarbr', 'GAMMA+ Pro Dryer', '1Z999AA10123456784', '2026-09-05', true),
  ('@fademaster', 'GAMMA+ Pro Clipper Set', '1Z999AA10123456785', '2026-09-18', true),
  ('@barberlife_official', 'Johnny B Holiday Gift Set', null, null, false)
) as g(handle, product_name, tracking_number, shipped_date, delivered) on g.handle = i.handle;
