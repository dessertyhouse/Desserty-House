# Safe database migration instructions

All current migration files are designed to be **safe to run more than once**. They use `create table if not exists`, `add column if not exists`, and duplicate-safe blocks for types/constraints/policies.

## Run order

1. `supabase-schema.sql`
2. `worker-workflow-migration.sql`
3. `admin-v2-migration.sql`
4. `cms-admin-migration.sql` (only when implementing the database-driven full CMS)

If Supabase shows an older error such as `type "staff_role" already exists`, you are running an older copy of `cms-admin-migration.sql`. Replace it with the latest project copy and run again.

## Do not run migrations in Neon

This project’s live admin/order tables are in **Supabase**. Run SQL in Supabase SQL Editor for the same project used by `NEXT_PUBLIC_SUPABASE_URL`.

## Safety

These are schema migrations, not demo-data scripts: they do not delete orders, posts, workers or customer records. Still export/backup production data before any future migration that changes or deletes existing columns.
