# NeetCode 150 Tracker

A spaced-repetition tracker for working through the [NeetCode 150](https://neetcode.io/practice) — built for interview prep, not just checking boxes.

Every problem you solve gets rated 1–4 based on how it went, and a graduated-recall scheduler (similar to Anki/SuperMemo) decides when it should come back for review — problems you nail confidently drift further apart over time, ones you struggle with come back sooner. A problem is only marked "mastered" once it's been reviewed well, consistently, over roughly two months — not after one lucky solve.

**Stack:** Next.js (App Router) + Prisma + Neon Postgres + Tailwind/shadcn, deployed on Vercel.

**Live:** https://neetcode-tracker-beta.vercel.app

## Setup

\`\`\`bash
git clone https://github.com/sahana-kulkarni/neetcode-tracker.git
cd neetcode-tracker
npm install
cp .env.example .env # fill in your Neon DATABASE_URL and DIRECT_URL
npx prisma db push
npx prisma db seed
npm run dev
\`\`\`
