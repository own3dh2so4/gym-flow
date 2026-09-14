# Gym Flow

Gym Flow is a personal training PWA for varied monthly gym programs. It is designed for mobile use, works without an account, and stores completed workouts in the browser.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. For a production check:

```bash
npm run typecheck
npm test
npm run build
npm start
```

## Deploy to Vercel

Import the repository into Vercel. The framework is detected as Next.js and no environment variables are required.

## Product notes

The app currently ships with a curated annual cycle: three-day full-body, upper/lower, A/B, strength, conditioning, and hypertrophy blocks. Progress is stored locally. Use the browser's site-data backup or the settings screen before changing devices.

Exercise guidance is educational and should be adapted to the user's level. Stop if pain occurs and ask a qualified professional for individual advice.

## Training rationale

Each month contains three or four weekly sessions with 6–8 movements per session. Every block uses three progressive weeks followed by a lower-volume week. The programs prioritize regular training of all major muscle groups, controlled high-effort sets, and gradual load or repetition increases.

The programming approach follows the broad recommendations in the [2026 ACSM resistance training position stand](https://doi.org/10.1249/mss.0000000000003897) and the [WHO physical activity guidance](https://www.who.int/europe/news-room/fact-sheets/item/physical-activity). It is general fitness guidance, not an individual medical or rehabilitation prescription.
