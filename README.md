# ALYN ILA Scout

Internal field notes app for logging ILA Berlin aerospace supplier conversations.

This is a standalone Next.js App Router project. It is not the public ALYN website, not the ALYN Aerospace landing page, and not a CRM.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a Supabase project and run:

```sql
-- supabase/schema.sql
```

3. Copy `.env.example` to `.env.local` and fill in:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
APP_PASSWORD=
```

4. Start the app:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

## Environment Variables

- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: Server-only service role key. Never expose this in browser code.
- `APP_PASSWORD`: Simple internal password used by the password screen.

## Pages

- `/`: Password-gated conversation form.
- `/records`: Password-gated Excel-style record table with search, filters, follow-up copy, and CSV export.

## Notes

- All form fields are optional.
- Records are saved through server-side API routes only.
- Lead score, lead status, suggested action, and generated follow-up are calculated on the server before saving.
- Access state is stored in `localStorage` after a successful password check.
