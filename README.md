# TOKEN

**Absolutely nothing. Earn it anyway.**

TOKEN is a polished, deliberately pointless virtual-currency website. Leave the page open to earn five Tokens every five minutes, watch fictional eight-second advertisements for bonus Tokens, collect achievements, and compare your score with a clearly labeled sample leaderboard.

Tokens have no real-world value. They cannot be purchased, transferred, redeemed, or spent.

## Run locally

Open index.html directly in a modern browser. No package manager, build step, API key, server, or paid service is needed.

## Publish with GitHub Pages

This repository includes an automated workflow at .github/workflows/pages.yml. It publishes the static site whenever a commit reaches the main branch.

1. Open the repository's **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Open the **Actions** tab and select the **Deploy TOKEN to GitHub Pages** workflow.
4. Wait for the run to finish successfully.

The expected project-site address is https://alphacat731-rgb.github.io/Tokens/

The repository URL and the expected Pages URL are not proof of a successful deployment. Check the Pages settings and the latest workflow run.

## How earning works

- The client stores the guest balance, username, interval progress, achievements, and recent activity in localStorage.
- Five whole Tokens are awarded for each completed five-minute interval while an active tab is heartbeating.
- A localStorage lease elects a single tab to maintain the timer. Closing the active page releases the lease; another open tab may take over.
- To avoid granting offline time after a crash, device sleep, or long browser suspension, heartbeat gaps longer than about 65 seconds are ignored. On resume, the timer continues from saved progress. Browsers differ, so this is a practical approximation, not proof of attention or tamper resistance.
- Fake advertisements are entirely simulated, take about eight seconds, award fifteen Tokens only after completion, and apply a short cooldown. Closing early gives no reward.
- All profile and balance information is local to that browser. It does not synchronize across devices.
- The leaderboard is fictional sample data. It is not a shared or live ranking.

Client-side balances can be changed by the device owner. This project is a playful frontend prototype, not a secure financial system.

## Project files

- index.html — accessible application shell and dialogs
- styles.css — responsive design system, animations, and reduced-motion support
- script.js — local guest state, earning timer, fake ads, profile, achievements, and sample leaderboard
- assets/token-cube.png — the supplied, pixel-identical TOKEN cube symbol
- assets/token-cube-dark.png — an alpha-preserving dark-stroke variant for favicon contrast
- .github/workflows/pages.yml — GitHub Pages deployment

## Privacy

No ad network, analytics script, external font, tracking pixel, or remote database is used. Guest data stays in browser local storage.


## Enable the real global leaderboard (Supabase)

The site now includes a Supabase-backed global leaderboard integration. It intentionally shows **DEMO LEADERBOARD** until a real project is configured; it never labels sample entries as live.

1. Create or open a Supabase project at https://supabase.com/.
2. In Supabase **SQL Editor**, run the complete contents of `supabase/schema.sql`.
3. In **Authentication → Sign In / Providers**, enable **Anonymous Sign-Ins** for guest identities.
4. In **Project Settings → API**, copy the Project URL and the public anon/publishable key. Never use a `service_role` or secret key in a static website.
5. Put those two public values in `supabase-config.js` (`url` and `anonKey`).
6. Commit and push the configuration change to `main`, then open the site. The label switches to **LIVE GLOBAL LEADERBOARD** when anonymous sign-in and the RPC/database setup succeed.

Supabase's public anon key is meant for browser use only when paired with Row Level Security and safe database functions. The SQL enables RLS, removes direct table access from browser roles, and grants access through narrow functions. Reward increments are committed in the database and leaderboard totals are calculated from reward events, so visitors share the same Today / This Week / All Time ranking.

This remains a casual, no-value game: a static client can still be inspected or automated, and anonymous identities are not strong proof of a unique human. Do not use the board for anything valuable or safety-critical. If the shared service is unreachable, the page falls back to local-only rewards and clearly returns to demo mode.

The Supabase browser client is loaded only when both configuration values are present. No service secret is required, and no paid tier is required by this code itself.


### Global board setup note

The global leaderboard is not active on the live site until a Supabase project is configured. This repository contains the integration and SQL, but a project's URL/public key and its database need to be supplied by the project owner. Until then, TOKEN deliberately shows the labeled demo board.