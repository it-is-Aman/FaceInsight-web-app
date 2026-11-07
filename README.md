# FaceInsight AI

**Understand your skin from one selfie.** FaceInsight detects 15 common facial skin concerns with a custom-trained ResNet-50, then uses Gemini to turn the results into a personalised morning/evening routine you can ask follow-up questions about. Photos are processed in memory and never stored.

> Educational tool, not a medical device. It does not diagnose disease.

| | |
|---|---|
| **Web app** | Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui |
| **Backend** | Next.js route handlers · Prisma 7 · PostgreSQL (Neon) · Clerk auth · Dodo Payments |
| **AI** | ResNet-50 (fastai → **ONNX**) on FastAPI · OpenCV YuNet face detection · Google Gemini (structured output + streaming chat) |
| **Hosting** | Vercel (web) · Hugging Face Spaces, Docker (ML) |

ML service repo: [`ml-model`](../ml-model) · Deep-dive guide: [`docs/HOW_IT_WORKS.md`](docs/HOW_IT_WORKS.md)

---

## Features

- **Selfie → skin report in seconds.** Upload or take a photo. It is compressed on-device, quality-checked (brightness, resolution) and analysed.
- **Honest confidence.** Results are shown as *Likely / Possible / Low signal* instead of falsely precise percentages.
- **AI care guide.** A structured morning and evening routine, ingredients to look for, things to avoid, and when to see a dermatologist.
- **Follow-up chat.** Streaming answers that know your results, capped per analysis.
- **Try before you upload.** A one-click demo report that needs no photo and no account.
- **Free daily allowance.** 1 free analysis without an account, then a daily allowance per signed-in user (default 10 per rolling 24 h). One-time passes via Dodo Payments are built in behind a feature flag (`NEXT_PUBLIC_PAYMENTS_ENABLED`) and turned off until live payments are approved. Failed analyses never count.
- **History.** Signed-in users can revisit every report. Guest reports move to the account on sign-up.
- **SEO and accessibility.** Statically generated guides for all 15 concerns, JSON-LD, sitemap, Open Graph image, dark mode, keyboard and screen-reader friendly.

## Architecture

```
Browser ──► Next.js on Vercel ─────────────────────────────────────────────┐
  │           ├─ Clerk (auth)                                             │
  │           ├─ Postgres via Prisma: users, credits, analyses, chat       │
  │           ├─ Gemini: care guide (JSON schema) + chat (streamed)       │
  │           ├─ Dodo Payments: checkout + signed webhook                 │
  │           └─ POST /predict  (X-API-Key) ──► FastAPI on HF Spaces       │
  │                                              ├─ YuNet face detection   │
  │                                              └─ ResNet-50 (ONNX)       │
  └─ compresses photo on-device, keeps a thumbnail in sessionStorage only ─┘
```

The ML service does one job: image in, labels out. Everything stateful (auth, credits, AI text, payments) lives in the web app, so the model can scale to zero for free.

## Getting started

**Prerequisites:** Node 22+, pnpm 11, PostgreSQL (or a free Neon database), and the [ML service](../ml-model) running locally or on Hugging Face.

```bash
pnpm install                 # also runs `prisma generate`
cp .env.example .env         # fill in the values below
pnpm db:migrate              # create tables in your dev database
pnpm dev                     # http://localhost:3000
```

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | ✅ | Postgres connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | ✅ | Clerk auth |
| `CLERK_WEBHOOK_SIGNING_SECRET` | | Syncs user updates and deletions (`/api/webhooks/clerk`) |
| `ML_SERVICE_URL` | ✅ | e.g. `https://<user>-<space>.hf.space` (server-only) |
| `ML_API_KEY` | ✅ | Shared secret; must match the ML service |
| `GEMINI_API_KEY` | ✅ | Google AI Studio key |
| `GEMINI_MODEL`, `GEMINI_FALLBACK_MODEL` | | Default `gemini-2.5-flash`, then `gemini-flash-latest` |
| `DODO_PAYMENTS_API_KEY`, `DODO_PAYMENTS_WEBHOOK_KEY` | for payments | Checkout and webhook signature verification |
| `DODO_PAYMENTS_ENVIRONMENT` | | `test_mode` (default) or `live_mode` |
| `DODO_PAYMENTS_PRODUCT_ID_2DAYS`, `DODO_PAYMENTS_PRODUCT_ID_7DAYS` | for payments | Product ids from the Dodo dashboard |
| `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_URL` | | Absolute URLs for redirects and SEO |
| `IP_HASH_SALT` | recommended | Salt for the hashed guest rate-limit key |
| `NEXT_PUBLIC_PAYMENTS_ENABLED` | | `false` (default): pricing hidden, daily allowance. `true`: pricing + Dodo checkout |
| `NEXT_PUBLIC_DAILY_ANALYSIS_LIMIT` | | Analyses per signed-in user per 24 h while payments are off (default 10) |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_GA_MEASUREMENT_ID` | | Analytics (optional) |

### Scripts

| Command | What it does |
|---|---|
| `pnpm dev` / `pnpm build` / `pnpm start` | Next.js dev server, production build, production server |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` | ESLint, `tsc --noEmit`, Vitest |
| `pnpm db:migrate` | Create and apply a migration in development |
| `pnpm db:deploy` | Apply pending migrations in production |
| `pnpm db:studio` | Browse the database |

## Project structure

```
src/
├─ app/
│  ├─ page.tsx                      landing page
│  ├─ analyze/                      upload flow
│  ├─ analysis/[id]/                report (server-rendered, owner only)
│  ├─ history/ pricing/ conditions/ about/ privacy/ terms/
│  └─ api/
│     ├─ analyses/                  POST create analysis (upload or demo)
│     ├─ analyses/[id]/insights/    POST generate or return the cached care guide
│     ├─ analyses/[id]/chat/        POST streamed follow-up answer
│     ├─ payment/checkout|webhook/  Dodo Payments
│     ├─ webhooks/clerk/            user sync
│     ├─ me/                        credit balance
│     └─ ml/wake/                   pings the ML service so it starts booting
├─ components/                      ui/ (shadcn), layout/, home/, analyze/, report/, pricing/
├─ lib/                             env, db, ml client, gemini, credits, viewer, conditions, plans, seo
├─ proxy.ts                         Clerk middleware (Next 16 "proxy")
prisma/                             schema + migrations
```

## Deployment

1. **ML service:** push [`ml-model`](../ml-model) to a Hugging Face Docker Space (steps in its README) and set `ML_API_KEY` as a Space secret.
2. **Database:** create a Neon database, then run `pnpm db:deploy`.
3. **Web:** import this repo into Vercel and add the environment variables above.
4. **Webhooks:** point Dodo at `https://<app>/api/payment/webhook` and Clerk at `https://<app>/api/webhooks/clerk`.

## Privacy

Photos are compressed in the browser, sent over HTTPS, analysed in memory and discarded. Only the labels, confidence scores and generated text are stored. Guest rate limiting uses a random cookie id and a salted one-way IP hash, never a raw IP. Gemini only ever receives labels and questions, never the image.

## License

See [LICENSE](LICENSE).
