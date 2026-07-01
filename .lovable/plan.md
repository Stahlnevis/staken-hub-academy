
# Staken Hub Admin CMS

Goal: give you a single `/admin` dashboard (behind login + admin role) where you can edit every page of the public site — no code, ever. The public site reads content from the database at load time, so anything you save in the CMS shows up instantly on the live site.

## Admin dashboard layout

Sidebar navigation at `/admin` with these sections:

1. **Dashboard** — overview: counts (programmes, bootcamps, posters, messages), quick links, recent activity.
2. **Site Settings** — global: site name, tagline, phone, email, address, social links (FB / IG / LinkedIn / X / YouTube / WhatsApp), Google Maps embed URL, footer copy.
3. **Home Page** — hero title, subtitle, hero CTA buttons, stats (learners / partners / etc.), "Why choose us" cards, learning modes, final CTA copy.
4. **About Page** — mission, vision, story paragraphs, values (add/edit/delete), team members (name, role, photo, bio).
5. **Programmes** — full CRUD: title, slug, category, duration, level, price, short + long description, syllabus bullets, outcomes, cover image, "featured" flag, display order.
6. **Bootcamps** — full CRUD, same shape as programmes plus start/end date and seats.
7. **Events / Posters** — already exists; move under admin sidebar. Add edit (currently only create/delete).
8. **Corporate Training** — hero, service cards, client logos, corporate testimonials, CTA.
9. **Success Stories** — CRUD alumni stories (name, photo, cohort, quote, current role, company, linkedin).
10. **Contact Messages** — inbox of form submissions (read-only + mark-as-read + delete).
11. **Media Library** — browse/upload/delete images in the storage bucket, copy URL.
12. **Users & Roles** — list users, grant/revoke admin role (admin-only).

## Public site wiring

Each public page becomes data-driven:
- Loader calls a public `createServerFn` that reads from the DB via the publishable-key client (narrow `TO anon` SELECT policies).
- Falls back to sensible defaults if a row is empty so the site never looks broken while you're editing.
- Uses TanStack Query so edits reflect on refresh without a rebuild.

## Data model (new tables)

- `site_settings` (singleton row, key/value JSON) — global settings.
- `page_content` (page_key, section_key, content JSONB) — flexible per-page blocks (home, about, corporate).
- `programmes` — replaces hardcoded `src/lib/programmes.ts`.
- `bootcamps`.
- `team_members`.
- `success_stories`.
- `corporate_clients` (logos).
- `contact_messages` — captures the contact form.
- (existing) `announcements` — posters, keep as is.

All tables: RLS on. Public SELECT for the display tables via `TO anon`. INSERT/UPDATE/DELETE restricted to `has_role(auth.uid(), 'admin')`. `contact_messages`: INSERT open to anon (form submission), SELECT/UPDATE/DELETE admin-only.

## Storage

One `media` bucket (public read, admin write) for all uploaded images — posters, programme covers, team photos, client logos.

## Auth

Reuses the existing `/auth` sign-in and `user_roles` table. Only users with `role = 'admin'` see `/admin/*`. The route guard checks the role via the existing `has_role` RPC.

## Build order (single delivery)

1. Migration: all new tables + RLS + grants + storage bucket policies.
2. Admin shell (`/_authenticated/admin/*` with sidebar + role gate).
3. CRUD screens for each section (reusable table + form components).
4. Public server fns + rewire every public route loader to read from DB.
5. Seed migration inserting current hardcoded content so nothing visually changes on day one.

## Technical notes (for me)

- Server fns in `src/lib/cms/*.functions.ts`, protected with `requireSupabaseAuth` + admin role check.
- Public reads in `src/lib/cms/public.functions.ts` using server publishable client.
- Reusable `<AdminTable>`, `<AdminForm>`, `<MediaPicker>` components.
- Rich text via a lightweight markdown textarea (no heavy WYSIWYG dep) — rendered with `react-markdown`.

Approve and I'll ship it end-to-end in the next turn (migration first, then code once it's approved).
