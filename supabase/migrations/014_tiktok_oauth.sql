-- Real TikTok Login Kit connection now stores full account stats, not just
-- followers. access_token/refresh_token were already text columns (011);
-- they now hold app-layer-encrypted values (see lib/social/encryption.ts),
-- never plaintext.
alter table social_connections add column if not exists avatar_url text;
alter table social_connections add column if not exists likes_count bigint;
alter table social_connections add column if not exists video_count integer;
alter table social_connections add column if not exists refresh_token_expires_at timestamptz;
