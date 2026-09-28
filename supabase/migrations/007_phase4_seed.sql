-- Sample payments
insert into payments (campaign_influencer_id, payment_type, amount, status, description, paid_at)
select id, 'flat_fee', 1500.00, 'paid', 'GAMMA+ Launch — flat fee', now() - interval '14 days'
from campaign_influencers
order by created_at
limit 1;

insert into payments (campaign_influencer_id, payment_type, amount, status, description)
select id, 'commission', 738.40, 'pending', 'GAMMA+ Launch — Sep commissions'
from campaign_influencers
order by created_at
limit 1;

-- Sample payment schedule
insert into payment_schedule (campaign_influencer_id, payment_type, amount, scheduled_date)
select id, 'flat_fee', 750.00, current_date + interval '14 days'
from campaign_influencers
order by created_at
offset 1 limit 1;
