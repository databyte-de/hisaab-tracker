# Len-Den

testing
testing line two

A mobile-first web app for tracking dues, lent money, and miscellaneous expenses with friends and family. Built with React, Tailwind, and Supabase. Per-user data isolation via Google sign-in + Postgres Row-Level Security.

**Live:** https://databyte-de.github.io/hisaab-tracker/

## Features

- **Udhari** — track money you've lent (with partial repayments and history)
- **Muft** — track money given freely (no repayment expected)
- **Hisaab-Barabar** — archive of settled records
- Per-user private data (Google OAuth + Supabase RLS)
- Light & dark theme with system preference detection
- Itemized amount breakdown for split bills
- Inline edit, delete, and restore on every record

## Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind v4, motion/react, lucide-react
- **Backend:** Supabase (Postgres + Auth)
- **Hosting:** GitHub Pages (auto-deployed from `main` via GitHub Actions)

## Run locally

**Prerequisites:** Node.js 20+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` (optional — falls back to hardcoded public values in `src/lib/supabase.ts`):
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Run the dev server:
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:3000/hisaab-tracker/`.

4. Type-check:
   ```bash
   npm run lint
   ```

## Backend setup

If you fork this and want to point it at your own Supabase project, you need to do three things in your Supabase dashboard:

### 1. Schema

```sql
create table entries (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('tab', 'on_the_house')),
  person_name text not null,
  purpose text not null,
  amount numeric not null,
  note text,
  date date,
  is_settled boolean not null default false,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now()
);

create table repayments (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references entries(id) on delete cascade,
  amount_received numeric not null,
  note text,
  date date,
  created_at timestamptz not null default now()
);
```

### 2. Row-Level Security

```sql
alter table entries enable row level security;
alter table repayments enable row level security;

create policy "own_entries_select" on entries for select using (auth.uid() = user_id);
create policy "own_entries_insert" on entries for insert with check (auth.uid() = user_id);
create policy "own_entries_update" on entries for update using (auth.uid() = user_id);
create policy "own_entries_delete" on entries for delete using (auth.uid() = user_id);

create policy "own_repayments_select" on repayments for select using (
  auth.uid() = (select user_id from entries where id = entry_id)
);
create policy "own_repayments_insert" on repayments for insert with check (
  auth.uid() = (select user_id from entries where id = entry_id)
);
create policy "own_repayments_update" on repayments for update using (
  auth.uid() = (select user_id from entries where id = entry_id)
);
create policy "own_repayments_delete" on repayments for delete using (
  auth.uid() = (select user_id from entries where id = entry_id)
);
```

### 3. Google OAuth

- **Google Cloud Console** → create an OAuth 2.0 Web Client.
  - Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
  - Authorized JavaScript origins: your local + production URLs (without paths).
- **Supabase → Authentication → Providers → Google:** paste Client ID + Secret, enable.
- **Supabase → Authentication → URL Configuration:**
  - Site URL: your production URL.
  - Redirect URLs: add local + production URLs (with paths).

While the Google OAuth app is in **Testing** mode (default), only emails added to the **Test users** list can sign in — up to 100 users without Google verification.

## Deployment

Push to `main`. The workflow at `.github/workflows/deploy.yml` builds and publishes to GitHub Pages. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in repo Settings → Secrets and variables → Actions.

## Project layout

```
src/
├── App.tsx                  # Auth gate + main UI
├── main.tsx                 # React entry
├── types.ts                 # Entry, Repayment, Category
├── index.css                # Tailwind v4 theme + CSS vars
├── components/
│   ├── PersonCard.tsx       # Per-person grouped record card
│   ├── AddEntryPanel.tsx    # Bottom-sheet for new entries
│   ├── EditEntryPanel.tsx   # Edit/delete an entry
│   ├── RepaymentPanel.tsx   # Record a repayment
│   ├── EditRepaymentPanel.tsx
│   ├── AmountBreakdown.tsx  # Itemized split calculator
│   └── SignInScreen.tsx     # Google sign-in landing
├── hooks/
│   ├── useAuth.ts           # Session, signInWithGoogle, signOut
│   ├── useHisaabData.ts     # CRUD + repayment-spreading logic
│   └── useTheme.ts          # Light/dark with system pref
└── lib/
    ├── supabase.ts          # Supabase client
    ├── api.ts               # Database calls (RLS enforces isolation)
    └── utils.ts             # cn() helper
```
