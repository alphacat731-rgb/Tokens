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
- To avoid granting offline time after a crash, device sleep, or long browser suspension, heartbeat gaps longer than 12 seconds are ignored. On resume, the timer continues from saved progress. Browsers differ, so this is a practical approximation, not proof of attention or tamper resistance.
- Fake advertisements are entirely simulated, take about eight seconds, award fifteen Tokens only after completion, and apply a short cooldown. Closing early gives no reward.
- All profile and balance information is local to that browser. It does not synchronize across devices.
- The leaderboard is fictional sample data. It is not a shared or live ranking.

Client-side balances can be changed by the device owner. This project is a playful frontend prototype, not a secure financial system.

## Project files

- index.html — accessible application shell and dialogs
- styles.css — responsive design system, animations, and reduced-motion support
- script.js — local guest state, earning timer, fake ads, profile, achievements, and sample leaderboard
- assets/token-cube.png — supplied TOKEN cube symbol
- .github/workflows/pages.yml — GitHub Pages deployment

## Privacy

No ad network, analytics script, external font, tracking pixel, or remote database is used. Guest data stays in browser local storage.
