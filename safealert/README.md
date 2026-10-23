# SafeAlert — Emergency Alert & Location Tracking (Demo)

A full-stack demo of a mobile "emergency button" that sends a user's live GPS
location to a real-time PC monitoring dashboard.

> **This is an educational/college-project demo.** It does **not** contact
> police, ambulance, or any real emergency service. It only sends data
> between your own mobile browser and your own dashboard browser via your
> Supabase project.

## Tech stack

- React 18 + TypeScript + Vite
- Tailwind CSS
- React Router
- Supabase (Postgres database, Auth, Realtime)
- Leaflet + OpenStreetMap (via `react-leaflet`) for maps
- Browser Geolocation API + Web Notifications API

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In **Project Settings → API**, copy the **Project URL** and the
   **anon/public key**. You will *not* need the `service_role` key for this
   app — never put that key in frontend code.
3. In **Project Settings → Authentication → Providers**, make sure
   **Email** sign-up is enabled (it is by default). For a quick classroom
   demo you can turn off "Confirm email" under **Authentication → Settings**
   so accounts are usable immediately after sign-up.

## 2. Set up the database

1. Open **SQL Editor** in your Supabase project.
2. Paste the contents of [`supabase/schema.sql`](./supabase/schema.sql) and
   run it. This creates the `profiles`, `emergency_alerts`, and `devices`
   tables, adds validation constraints, enables Row Level Security, and
   adds the policies described below.
3. Open **Database → Replication** and confirm `emergency_alerts` is part
   of the `supabase_realtime` publication (the SQL script does this for
   you, but it's worth double-checking).

### Row Level Security summary

| Table               | Who can read                          | Who can write                          |
|---------------------|----------------------------------------|------------------------------------------|
| `profiles`          | Any signed-in user                     | Only your own row                        |
| `emergency_alerts`  | Your own alerts, or all alerts if admin | Insert only as yourself; update = admin only |
| `devices`           | Your own device, or all if admin        | Only your own device row                 |

## 3. Configure the frontend

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

## 4. Install and run

```bash
npm install
npm run dev
```

Vite will print a local URL (e.g. `http://localhost:5173`) and, because
`server.host: true` is set in `vite.config.ts`, a **Network** URL too
(e.g. `http://192.168.1.23:5173`). Use the Network URL to open the app on
your phone as long as your phone and computer are on the same Wi‑Fi network.

> Most mobile browsers only grant GPS access over **HTTPS** or on
> **localhost**. For a real phone over the network, either use a tunnel
> tool (e.g. `npx ngrok http 5173`) to get an HTTPS URL, or deploy the app
> (Vercel/Netlify) and open the deployed HTTPS URL on your phone.

## 5. Try it out

1. Open the app, click **Sign up**, create one account as **Mobile User**
   and a second account as **Monitoring/Admin** (use two different emails —
   e.g. a normal tab and an incognito tab, or two browsers).
2. On the Mobile User account, go to **Mobile Emergency**, allow location
   access, and press the big red button (or **Test Alert**).
3. On the Admin account, go to **PC Monitoring Dashboard** — the alert
   appears instantly via Supabase Realtime, with a flashing banner, an
   optional sound, and a browser notification (if you click "Enable
   desktop notifications").
4. Click **View Location** on an alert to see it on the Leaflet/OpenStreetMap
   map. Click **Acknowledge** then **Resolve** to walk it through its
   lifecycle. Check **Alert History** to filter past alerts by date range,
   status, or user.

No second phone? Use **Demo Mode** in the dashboard sidebar to simulate
incoming alerts from sample users at sample locations — every row it
creates is tagged `DEMO`.

## Project structure

```
src/
  components/     Reusable UI: Button, AlertCard, MapView, DashboardLayout...
  contexts/       AuthContext (Supabase auth + profile)
  hooks/          useGeolocation, useAlerts (realtime + CRUD)
  lib/            Supabase client
  pages/
    LandingPage.tsx
    auth/         LoginPage, SignupPage
    mobile/       MobileEmergencyPage
    dashboard/    DashboardPage, AlertHistoryPage, DemoModePage
  types/          Shared TypeScript types
  utils/          geo distance, demo data, sound/notification helpers
supabase/
  schema.sql      Tables, constraints, indexes, RLS policies
```

## Error handling built in

- **GPS permission denied / unavailable** — the alert still sends, but is
  clearly marked "location unavailable" instead of inventing coordinates.
- **Duplicate button presses** — a send lock plus a short cooldown prevents
  firing multiple alerts from one confirmation.
- **Network / Supabase errors** — surfaced inline as readable error
  messages rather than failing silently.
- **Invalid coordinates** — validated both client-side and with a Postgres
  `check` constraint before an alert can be stored.
- **Notification permission denied** — the app still works; you simply
  won't get the OS-level popup (the in-app flashing banner and sound still
  fire).

## Security notes

- The Supabase `service_role` key is never used in this frontend.
- All access is governed by Postgres Row Level Security — a mobile user
  physically cannot query another user's alert history, even by editing
  requests in devtools.
- Coordinates are validated for range before insert.
- Location and notification permissions are requested only when the
  relevant feature is used, with clear in-UI explanations.
