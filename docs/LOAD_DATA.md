# Loading the data
Regenerate seed: `python3 scripts/clean_import.py && python3 scripts/make_seed.py`

1. Run `supabase/migrations/0001_schema.sql` (new database only), then `supabase/seed.sql`.
2. Run `supabase/migrations/0002_admin_auth.sql`, then `supabase/migrations/0003_approval_workflow.sql`.
3. Create administrator and Master Administrator accounts as described in the README.
