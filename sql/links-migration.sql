-- ===========================================================================
-- Desserty House — links on posts, feedback and gallery items
-- Safe to run more than once.
--
-- Adds a `links` JSON column to `posts`, used by both blog/offer posts and
-- customer feedback screenshots. Each entry looks like:
--     [{ "url": "https://wa.me/9189...", "label": "Order this" }]
--
-- Gallery links need no migration: the gallery lives in site_settings under
-- key 'gallery', and each item simply gains an optional `links` array.
-- ===========================================================================

alter table public.posts
  add column if not exists links jsonb not null default '[]'::jsonb;

comment on column public.posts.links is
  'Admin-added links shown on the post: [{url,label}]. Sanitised server-side.';
