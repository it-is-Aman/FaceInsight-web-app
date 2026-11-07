# How FaceInsight AI works, end to end

A deep-dive into every layer of the project: the model, the ONNX conversion, the inference service, the web backend, payments, AI text generation and the frontend. Each section explains **what** we use, **why**, and **how it works under the hood**, so you can maintain it and talk about it confidently in an interview.

**Contents**

1. [The big picture](#1-the-big-picture)
2. [One request, step by step](#2-one-request-step-by-step)
3. [The skin model (ResNet-50 + fastai)](#3-the-skin-model-resnet-50--fastai)
4. [From fastai to ONNX](#4-from-fastai-to-onnx)
5. [Face detection (YuNet)](#5-face-detection-yunet)
6. [The ML service (FastAPI)](#6-the-ml-service-fastapi)
7. [Hosting the model (Hugging Face Space)](#7-hosting-the-model-hugging-face-space)
8. [The web backend (Next.js route handlers)](#8-the-web-backend-nextjs-route-handlers)
9. [Database (Postgres + Prisma)](#9-database-postgres--prisma)
10. [Identity: users and guests](#10-identity-users-and-guests)
11. [Credits: atomic, race-free billing](#11-credits-atomic-race-free-billing)
12. [Payments and webhooks](#12-payments-and-webhooks)
13. [Gemini: care guide and chat](#13-gemini-care-guide-and-chat)
14. [The frontend](#14-the-frontend)
15. [Security: what changed from v1 and why](#15-security-what-changed-from-v1-and-why)
16. [Testing and verification](#16-testing-and-verification)
17. [Deployment and operations](#17-deployment-and-operations)
18. [Glossary of tools and libraries](#18-glossary-of-tools-and-libraries)
19. [Interview questions you should be ready for](#19-interview-questions-you-should-be-ready-for)
20. [Where to take it next](#20-where-to-take-it-next)

---

## 1. The big picture

FaceInsight has **two services** in **two repos**:

| | `ml-model` | `web-app` |
|---|---|---|
| Language | Python 3.12 | TypeScript |
| Framework | FastAPI | Next.js 16 (App Router) |
| Job | Image in → labels + confidence out | Everything else: UI, auth, credits, payments, AI text, history |
| State | **Stateless**: no database, no disk writes | Postgres via Prisma |
| Hosting | Hugging Face Space (Gradio, ZeroGPU hardware, CPU inference) | Vercel |

```
┌──────────── Browser ────────────┐
│ compress photo, quality check   │
│ keep thumbnail in sessionStorage│
└───────────────┬─────────────────┘
                │ multipart upload (≤ 4 MB)
┌───────────────▼─────────────────────────────── Vercel ─┐
│ Next.js route handlers                                  │
│  • Clerk: who is this?                                  │
│  • Postgres: credits, analyses, chat history            │
│  • Gemini: care guide (JSON) + chat (streamed)          │
│  • Dodo: checkout + signed webhooks                     │
└───────────────┬─────────────────────────────────────────┘
                │ Gradio API "analyze" + API key (server to server)
┌───────────────▼──────────────────── Hugging Face Space ─┐
│ Gradio → YuNet face check → ResNet-50 (ONNX, CPU)       │
└─────────────────────────────────────────────────────────┘
```

**Why split it this way?** Python has the best ML tooling, while JavaScript/TypeScript is best for the product UI. Keeping the ML service stateless means it can **sleep when idle and wake on demand**, which is what makes free hosting possible. It also keeps the model reusable from any client.

---

## 2. One request, step by step

What happens when a user clicks **Analyze photo**:

1. **The analyze page opens** and immediately calls `GET /api/ml/wake`. The server pings the ML service's `/health`, so a sleeping Space starts booting while the user is still choosing a photo.
2. **The user picks a photo.** `checkQuality()` draws it onto a 64×64 canvas and computes average brightness, warning if it's too dark or too bright, or below 400 px.
3. **Compression** (`browser-image-compression`): the photo is resized to at most 1600 px and saved as JPEG under 1.5 MB. This removes EXIF metadata (GPS and similar), speeds up the upload, and keeps us under Vercel's 4.5 MB request limit.
4. **Upload:** `POST /api/analyses` with `multipart/form-data`.
5. **The server validates** the type (JPEG/PNG/WebP) and size (≤ 4 MB).
6. **Allowance check:**
   - *Signed in:* `consumeCredit()` atomically takes one credit, or returns `402 NO_CREDITS`.
   - *Guest:* count this guest's uploads in the last 24 h by cookie id **or** IP hash; if ≥ 1, return `401 SIGN_IN_REQUIRED`.
7. **Call the ML service:** `predict()` sends the image (base64) and the API key to the Space's Gradio `analyze` endpoint, with a 50 s timeout (Vercel Hobby caps functions at 60 s).
8. **The ML service:** decodes the image → applies EXIF rotation → YuNet checks there's a face → preprocesses → ResNet-50 in ONNX Runtime → softmax → returns the top 3 labels.
9. **Save:** an `Analysis` row stores the predictions (never the photo), and the server returns `{ id }`.
   - If anything in steps 7–9 fails, `refundCredit()` returns the credit.
10. **Client:** stores a small thumbnail in `sessionStorage` (on this device only), refreshes the credit badge, and navigates to `/analysis/{id}`.
11. **Report page (server component):** checks ownership, loads predictions, cached insights and chat history, and renders.
12. **Insights:** if none are cached, the client calls `POST /api/analyses/{id}/insights`. Gemini returns JSON matching our schema, which is validated and saved.
13. **Chat:** `POST /api/analyses/{id}/chat` saves the question and streams Gemini's answer token by token, then saves the answer.

---

## 3. The skin model (ResNet-50 + fastai)

### What it is

- **Architecture:** ResNet-50, a 50-layer convolutional neural network (CNN) with about **25.6 million parameters**.
- **Task:** single-label image classification into **15 classes** (labels are in `ml-model/model/labels.json`): blackheads, dark circles, dark spots, dry skin, dull skin, eye bags, face redness, forehead wrinkles, hormonal acne, large pores, oily skin, razor bumps, rough texture, sebaceous filaments, under-eye wrinkles.
- **Input:** a 224×224 RGB image. **Output:** 15 numbers (logits) → softmax → 15 probabilities that sum to 1.

### Key ideas you should understand

**Convolutional layers** slide small filters across the image to detect patterns: early layers find edges and colours, middle layers find textures (pores, fine lines), and deep layers find larger structures.

**Residual connections** (the "Res" in ResNet): each block adds its input back to its output (`out = F(x) + x`). This lets gradients flow through very deep networks during training, which is what made 50+ layer networks trainable.

**Transfer learning:** the model started from ResNet-50 weights pre-trained on ImageNet (1.2 M everyday photos). fastai replaced the final layer with a new 15-class "head" and fine-tuned it. That's why it works with a relatively small dataset: it already knows how to "see".

**Softmax:** turns raw scores into probabilities: `p_i = exp(z_i) / Σ exp(z_j)`. The values are relative, so a 0.52 for "oily skin" means "more oily than anything else in the 15", **not** "52 % accurate".

### What the training pipeline looked like

We inspected `export.pkl` (fastai's saved `Learner`) and found:

| Stage | Transform | Purpose |
|---|---|---|
| Per image | `RandomResizedCrop(224, min_scale=0.5)` | Augmentation: random zoom/crop each epoch |
| Per batch | `IntToFloatTensor` (÷255) | Pixels 0–255 → 0–1 |
| | `Flip(p=0.5)` | Random horizontal flip |
| | `Brightness(max_lighting=0.2)` | Random brightness changes |
| | `Normalize(ImageNet mean/std)` | Same input scale the pre-trained weights expect |
| Loss | `CrossEntropyLoss` | Standard multi-class loss |

**Augmentation only happens during training.** At inference, fastai uses the *validation* version of `RandomResizedCrop`: resize the whole image to 256×256 (aspect ratio is squashed, not preserved) and then centre-crop to 224×224. Knowing that detail is what made the ONNX version match exactly (section 4).

### Why we show "Likely / Possible / Low signal"

Softmax probabilities are often **over-confident** and are not calibrated accuracy. Showing "87.3 %" implies precision the model doesn't have. Bands (`≥ 0.5` Likely, `≥ 0.2` Possible, otherwise Low signal) are more honest and less alarming. See `confidenceBand()` in `src/lib/conditions.ts`.

### Known limitations (good to admit in interviews)

- Single-label: a face can have several concerns at once, but softmax forces them to compete. A multi-label model (sigmoid per class) would fit the problem better.
- Sensitive to lighting, makeup, filters and camera quality.
- Training data diversity (skin tones, ages, devices) determines fairness. Evaluate per-group before claiming accuracy.

---

## 4. From fastai to ONNX

### The problem with `export.pkl`

- It is a Python **pickle**, which needs the exact fastai and PyTorch versions to load, and pulls in about 2 GB of dependencies at serve time.
- Unpickling **can execute arbitrary code**, so you must only load files you trust.
- It was saved on Windows, which is why the old code needed the `pathlib.WindowsPath = PosixPath` hack.

### What ONNX is

**ONNX (Open Neural Network Exchange)** is a standard file format for a model: a **computation graph** (Conv → BatchNorm → ReLU → …) plus the **weights**. Any runtime can execute it: ONNX Runtime (Python, C++, JS, mobile), TensorRT, OpenVINO, even the browser. An **opset** is the version of the operator set the graph uses; we used opset 17.

**ONNX Runtime** is Microsoft's inference engine for ONNX. On CPU it fuses operations (e.g. folds BatchNorm into the preceding Conv), uses optimised kernels, and needs no PyTorch.

### How we exported it (`ml-model/scripts/export_onnx.py`)

```python
learn = load_learner("export.pkl", cpu=True)
model = learn.model.eval()                 # eval(): BatchNorm uses running stats, no dropout

class WithSoftmax(torch.nn.Module):        # bake softmax into the graph
    def forward(self, x): return torch.softmax(self.m(x), dim=1)

torch.onnx.export(WithSoftmax(model), torch.randn(1, 3, 224, 224), "model.onnx",
                  opset_version=17, input_names=["input"], output_names=["probs"],
                  dynamic_axes={"input": {0: "batch"}, "probs": {0: "batch"}})
```

- `torch.onnx.export` **traces** the model: it runs the dummy input through it and records every operation into the graph.
- `dynamic_axes` lets the batch size vary (useful for batching later).
- We wrap the model with softmax so the service gets probabilities directly.

### Re-implementing preprocessing

The ONNX graph contains only the network. **Preprocessing must be re-implemented exactly**, or predictions drift silently. In `ml-model/app/classifier.py`:

```python
img = img.convert("RGB").resize((256, 256), Image.BILINEAR)   # squash, like fastai validation
img = img.crop((16, 16, 240, 240))                            # centre 224×224
arr = (np.asarray(img, np.float32) / 255 - MEAN) / STD        # ImageNet normalisation
arr = arr.transpose(2, 0, 1)[None]                            # HWC → NCHW, add batch dim
```

**NCHW** means batch × channels × height × width, which is PyTorch's layout. PIL/NumPy images are HWC (height × width × channels), so we transpose.

### Verifying parity

The export script runs the same images through **both** `learn.predict` (fastai) and ONNX Runtime and compares the probabilities:

```
max |Δp| = 0.0000029   top-1 identical on all test images   ~15 ms per image on CPU
```

Always do this after any model conversion. "It runs" is not the same as "it's correct".

### What we gained

| | fastai pickle | ONNX |
|---|---|---|
| Serve-time deps | torch + torchvision + fastai (~2 GB) | onnxruntime + numpy + pillow (~150 MB) |
| Cold start | slow (import torch, unpickle) | fast |
| Portability | Python + matching versions | any ONNX runtime, including browser and mobile |
| Security | pickle can execute code | plain data |
| Model size | 98 MB | 102 MB (fp32) |

**Next steps:** quantise to INT8 with `onnxruntime.quantization` for about 4× smaller and faster inference (re-check accuracy afterwards), or run it in the browser with `onnxruntime-web` so photos never leave the device.

---

## 5. Face detection (YuNet)

Before classifying, we confirm the image contains a real face. Otherwise the classifier will confidently "diagnose" a cat or a wall.

- **v1 used Haar cascades** (2001-era, many false positives). **OpenCV 5 removed them**, so v1's code would break on upgrade.
- **v2 uses YuNet** (`cv2.FaceDetectorYN`): a tiny (230 KB) ONNX CNN detector bundled in `model/`. It returns boxes **with confidence scores**.

Rules in `app/main.py`:

- Confidence ≥ `MIN_FACE_CONFIDENCE` (0.75).
- The face covers ≥ 2 % of the image (rejects tiny faces in the background).
- The image is downscaled to at most 640 px for speed, and boxes are scaled back.
- **EXIF transpose** first: phone photos are often stored sideways with a rotation flag, and a sideways face isn't detected.

---

## 6. The ML service (FastAPI)

```
ml-model/
├─ app/
│  ├─ main.py         routes, auth, error handling
│  ├─ config.py       settings from env (pydantic-settings)
│  ├─ classifier.py   ONNX session + preprocessing
│  ├─ face.py         YuNet wrapper
│  └─ imaging.py      safe decode + EXIF rotation
├─ model/             model.onnx, labels.json, face_detection_yunet_2023mar.onnx
├─ tests/test_api.py  pytest (5 tests)
└─ Dockerfile
```

### Concepts used

- **FastAPI:** a Python web framework built on Starlette and Pydantic. You declare types, and it validates requests, serialises responses, and generates OpenAPI docs at `/docs`.
- **Lifespan:** models load **once** at startup (`@asynccontextmanager lifespan`) and live on `app.state`, not on every request.
- **Sync endpoint on purpose:** `def predict(...)`, not `async def`. FastAPI runs sync endpoints in a **thread pool**, so CPU-heavy inference doesn't block the event loop and `/health` stays responsive.
- **Dependency injection:** `Depends(require_api_key)` runs before the route. `secrets.compare_digest` compares keys in **constant time**, which prevents timing attacks.
- **pydantic-settings:** typed configuration from environment variables (`ML_API_KEY`, `MIN_FACE_CONFIDENCE`, …).
- **Bounded read:** `file.file.read(max_bytes + 1)` means a huge upload can't exhaust memory.

### API contract

```
POST /predict   (multipart: file)   header X-API-Key
200 → { predictions: [{label, confidence}×3], face: {detected, confidence}, model_version, inference_ms }
4xx → { error: { code, message } }   codes: UNAUTHORIZED, EMPTY_FILE, FILE_TOO_LARGE, INVALID_IMAGE, NO_FACE
GET /health → { status, model_version, labels }
```

Stable **error codes** (not just messages) let the web app react precisely, e.g. `NO_FACE` → "try a different photo".

---

## 7. Hosting the model (Hugging Face Space)

**What we use:** a Hugging Face **Space** with SDK **Gradio** and hardware **ZeroGPU**, which is the free option for compute Spaces. (Docker and CPU-only Gradio Spaces need a paid plan since 2026.)

**How ZeroGPU works:** the Space is a normal container with CPU and RAM, where all our code runs. A GPU is attached **only while a function decorated with `@spaces.GPU` runs**, and that GPU time is what the free daily quota (5 min) measures. Our ONNX model runs on **CPU** (`CPUExecutionProvider`, about 15 ms per image), so it never asks for a GPU and **never uses quota**. ZeroGPU refuses to start without at least one `@spaces.GPU` function, so `gradio_app.py` contains one placeholder that is never called.

**The code** (`ml-model/`):
- `app/service.py`: the shared pipeline (validate → decode → YuNet face check → classify). Used by both transports.
- `space/gradio_app.py`: the Space. `gr.api(analyze, api_name="analyze")` exposes a plain function as an API endpoint, and a small `gr.Blocks` page is the public demo. The demo button is hidden from the API listing (`api_visibility="private"`).
- `app/main.py`: the same pipeline as a FastAPI `/predict` service, for Docker hosts (Render, Cloud Run, a PRO Space). It's the fallback.

**How the web app calls it** (`src/lib/ml.ts`): Gradio's HTTP API is two requests:

```
POST /gradio_api/call/analyze   {"data": ["<base64 image>", "<ML_API_KEY>"]}   → {"event_id": "..."}
GET  /gradio_api/call/analyze/<event_id>   → Server-Sent Events, ending in:
     event: complete
     data: [{"predictions": [...], "face": {...}, ...}]      (or [{"error": {"code", "message"}}])
```

`readGradioComplete()` parses the event stream, and errors map to the same codes as before (`NO_FACE`, `INVALID_IMAGE`…), so the UI didn't change. `ML_BACKEND=auto` picks this client for `*.hf.space` URLs and the FastAPI client otherwise, so switching hosts is just changing `ML_SERVICE_URL`.

**Why base64 instead of a file upload?** Gradio file inputs require a separate upload call and store the file in the Space's temp cache. Sending base64 in the JSON body keeps it to one request and the image never touches disk, which is our privacy promise. (Demo-page uploads do go through Gradio's cache, which we clear hourly with `delete_cache`.)

**Model file:** `scripts/build_space.sh` bundles `model.onnx` (100 MB) into the upload, and Hugging Face stores large files automatically. Alternatively, set `MODEL_URL` and `app/model_store.py` downloads it on start with a **pinned SHA-256 check**. In the GitHub repo the model is tracked with **Git LFS**.

**Sleeping:** free Spaces sleep after about 48 h without visitors. We handle wake-ups with the wake ping (sent when the analyze page opens, so the Space boots while the user picks a photo), a 50 s timeout, the "waking up the model…" message, and a `503 ML_UNAVAILABLE` error with a retry button.

**Docker, for reference:** the `Dockerfile` uses `python:3.12-slim`, installs requirements before copying code (layer caching), runs as a non-root user, listens on `$PORT` and has a `HEALTHCHECK`. On a free Render instance (512 MB) it fits because ONNX needs about 280 MB, whereas PyTorch alone wouldn't fit.

**Why not AWS?** An always-on EC2 instance costs money even when idle.

---

## 8. The web backend (Next.js route handlers)

Next.js gives us frontend and backend in one deployment. `src/app/api/**/route.ts` files are **route handlers**: functions that receive a `Request` and return a `Response`, deployed as serverless functions on Vercel.

| Route | Purpose |
|---|---|
| `POST /api/analyses` | Upload or demo → credits → ML → save |
| `POST /api/analyses/[id]/insights` | Generate the care guide once, then return the cached copy |
| `POST /api/analyses/[id]/chat` | Streamed answer (signed-in users only, 20 questions per analysis) |
| `GET /api/me` | Credit balance for the header badge |
| `GET /api/ml/wake` | Warm up the ML service |
| `POST /api/payment/checkout` | Create a Dodo checkout session |
| `POST /api/payment/webhook` | Dodo → grant or refund a pass |
| `POST /api/webhooks/clerk` | Clerk → update or delete the user |

### Patterns worth knowing

- **`export const runtime = "nodejs"`** and **`maxDuration`**: run on Node (not Edge) for Prisma and crypto, and allow up to 60 s (the Vercel Hobby maximum) for cold starts.
- **`proxy.ts`** (Next 16's new name for `middleware.ts`): runs Clerk on every request. Only `/history` is protected there; API routes return JSON errors themselves.
- **Validated env** (`src/lib/env.ts`): Zod parses `process.env` on first use, so misconfiguration fails with a clear list of what's missing. It's **lazy** so `next build` doesn't need runtime secrets.
- **`import "server-only"`**: the build fails if a secret-holding module is ever imported into client code.
- **One error shape:** `{ error: { code, message } }` from `apiError()`, and `readApiError()` on the client.
- **Server components** (e.g. the report page) query the database directly and send HTML, with no API round-trip. **Client components** (`"use client"`) handle interactivity.
- **`PageProps<"/analysis/[id]">` and `RouteContext<…>`:** Next 16 generates types for route params (`next typegen`). `typedRoutes: true` type-checks every `<Link href>`.

---

## 9. Database (Postgres + Prisma)

**PostgreSQL** on **Neon** (serverless Postgres with a free tier and branching). **Prisma** is the ORM: you describe tables in `prisma/schema.prisma`, it generates a typed client and SQL migrations.

### Tables

```
users          user_id (Clerk id) PK, email unique, name
subscriptions  credit buckets: plan_type, predictions_limit, predictions_used,
               expiry_date, status, payment_id UNIQUE
analyses       id, user_id?, guest_id?, ip_hash?, source (upload|sample), sample_id?,
               predictions JSONB, face_confidence, model_version, insights JSONB?, created_at
chat_messages  id, analysis_id → analyses (cascade), role, content, created_at
```

- **JSONB** for predictions and insights: their shape is owned by the model and the prompt, and it's validated with Zod when read (`parsePredictions`, `parseInsights`).
- **Indexes** match the queries: `(user_id, created_at)` for history, `(ip_hash, created_at)` for the guest limit, `payment_id UNIQUE` for idempotency.
- **`onDelete: Cascade`:** deleting a user deletes their data (privacy promise).

### Prisma 7 specifics

- The generator is `prisma-client` with `output = "../src/generated/prisma"`, so the client is generated into your source tree (git-ignored) and regenerated on `postinstall`.
- The connection URL lives in **`prisma.config.ts`**, not in the schema.
- **Driver adapters:** `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`. Prisma uses the standard `pg` driver, which is lighter and works well serverless.
- **Singleton in dev:** the client is cached on `globalThis` so hot reload doesn't open hundreds of connections.

### The migration (`20261105000000_analyses_v2`)

Hand-written so no data is lost:

1. Create `analyses` and `chat_messages`.
2. **Copy** old `prediction_history` rows, converting `{condition, confidence, …}` JSON text into `{label, confidence}` JSONB.
3. Drop the old table and the unused `password_hash` column.
4. Remove duplicate subscriptions created by the old non-idempotent webhook, then add `UNIQUE(payment_id)`.

It was tested on a local Postgres with sample legacy rows. **Before running it on production, create a Neon backup branch**, then run `pnpm db:deploy`.

---

## 10. Identity: users and guests

- **Clerk** handles sign-up, sign-in, sessions and the user menu. On the server, `auth()` returns `userId`.
- **Lazy user sync:** `ensureUser(userId)` creates the DB row (with 10 free credits) the first time it's needed. A unique-violation catch handles two first requests racing each other.
- **Guests** get an `httpOnly` cookie `fi_guest` with a random UUID. JavaScript can't read it, and its 122 bits of randomness can't be guessed.
- **IP hash:** `sha256(salt + ip)`, truncated. It's used only for the guest limit, so clearing cookies doesn't reset it, and we never store raw IPs.
- **Ownership:** `getAnalysisForViewer()` returns a report only if `user_id` or `guest_id` matches the viewer. Anyone else gets a "not found" page.
- **Claiming:** when a guest signs up, their earlier analyses move to the account (`claimGuestAnalyses`).
- **Clerk webhook:** `user.deleted` deletes the DB user (cascading), and `user.updated` syncs email and name.

---

## 11. Credits: atomic, race-free billing

### Two modes, one switch

`NEXT_PUBLIC_PAYMENTS_ENABLED` (in `src/lib/plans.ts`) picks how allowances work:

| | Payments **off** (default) | Payments **on** |
|---|---|---|
| Signed-in users | `NEXT_PUBLIC_DAILY_ANALYSIS_LIMIT` uploads per **rolling 24 h** (default 10) | Credit buckets (free 10 + purchased passes) |
| How it's counted | `COUNT(analyses WHERE user_id AND source='upload' AND created_at > now-24h)` | Atomic conditional `UPDATE` (below) |
| When exhausted | `429 DAILY_LIMIT`, with the time until the next one frees up | `402 NO_CREDITS` → pricing page |
| Pricing page, nav link, checkout API | hidden / 404 | visible |

In daily mode nothing needs refunding: a failed analysis never creates a row, so it never counts. The rolling window means each analysis "comes back" exactly 24 h after it was used (`resetsAt` = oldest in-window upload + 24 h). Because it's `NEXT_PUBLIC_`, the value is baked in at build time, so **redeploy after changing it**.

### Credit buckets (payments on)

A user can hold several **buckets**: the free 10, plus any passes (2-day: 50 analyses; 7-day: "unlimited", stored as 1,000,000 so the maths stays uniform).

**The race-condition problem:** two simultaneous requests both read "1 credit left", both proceed, and the user gets 2 analyses for 1 credit. v1 had exactly this bug (check, then increment later).

**The fix** (`consumeCredit`): let the database enforce the rule inside a single `UPDATE`:

```ts
prisma.subscription.updateMany({
  where: { subscription_id, predictions_used: { lt: limit } },   // condition re-checked inside the UPDATE
  data:  { predictions_used: { increment: 1 } },
})  // count === 1 → charged; 0 → someone else took the last credit
```

Postgres locks the row during the update and re-evaluates the `WHERE` after waiting, so only one request can take the last credit. Buckets are tried **soonest-expiring first**, so paid passes are used before the free credits that never expire.

**Verified:** 12 parallel requests against 5 available credits charged exactly 5.

**Refunds:** if the ML call fails for any reason, `refundCredit()` decrements again, so users never pay for errors.

---

## 12. Payments and webhooks

**Flow:**

1. `POST /api/payment/checkout` → Dodo SDK `checkoutSessions.create({ product_cart, customer, metadata: { userId, plan }, return_url })` → redirect to `checkout_url`.
2. The user pays on Dodo's hosted page.
3. Dodo calls **our webhook** `payment.succeeded` → `grantPlan(userId, plan, payment_id)`.
4. The user lands on `/pricing?checkout=success`, and the header badge refreshes.

**Never trust the redirect.** Anyone can open `?checkout=success`. Only the server-to-server webhook grants anything.

**Webhook signatures (Standard Webhooks spec):** Dodo signs each request:

```
signature = base64( HMAC_SHA256( secret, webhook-id + "." + webhook-timestamp + "." + raw_body ) )
header    webhook-signature: v1,<signature>
```

`dodo().webhooks.unwrap(rawBody, { headers })` recomputes and compares the signature, and rejects old timestamps (replay protection). That's why we read the body as **raw text**: re-serialised JSON would change the bytes and break the signature. **v1 skipped this check, so anyone could POST a fake "payment succeeded".**

**Idempotency:** webhooks are delivered *at least once*, so retries happen. `payment_id UNIQUE` means a second insert throws P2002, which we treat as "already granted" and still answer 200. **Verified:** the same signed event sent twice → one pass.

**Refunds:** `refund.succeeded` marks the bucket `refunded`. Errors return 5xx so Dodo retries, which is safe because the handler is idempotent.

---

## 13. Gemini: care guide and chat

### Why Gemini runs in the web app now

v1 ran Gemini inside the ML service, stored results in a Python dict, and had the browser **poll** for them. That lost results on restart, leaked memory, broke with multiple workers, and exposed `/chat` publicly. Now the ML service only does inference, and Gemini calls live where auth, limits and the database are.

### Structured output (the care guide)

Instead of asking for text and parsing it with regex (v1), we give Gemini a **JSON Schema**, and it must reply with matching JSON:

```ts
const insightsSchema = z.object({ overview, concerns[], routine: { morning[], evening[] }, ingredients[], avoid[] })
config: { responseMimeType: "application/json", responseJsonSchema: z.toJSONSchema(insightsSchema) }
const insights = insightsSchema.parse(JSON.parse(res.text))   // validate anyway: never trust LLM output
```

One Zod schema gives us the TypeScript type, the JSON Schema for Gemini, and runtime validation. Results are **cached** in `analyses.insights`, so each report costs one generation. Demo reports reuse the first demo's insights.

### Safety prompt

A system instruction keeps the model in scope: no diagnosis or prescriptions, certainty matched to the confidence band, escalate urgent signs to a dermatologist, decline off-topic questions. Gemini only ever sees **labels and questions, never the photo**.

### Reliability

- `timeout: 25 s` and a single attempt per model, then **fall back** to the other model on 404 (retired), 429 (rate limited) or 5xx (overloaded). We saw `gemini-flash-latest` return 503 "high demand" in testing, and the fallback answered in about 12 s.
- Model names come from env (`GEMINI_MODEL`, `GEMINI_FALLBACK_MODEL`), so you can switch without a code change.

### Streaming chat

- **Server:** `generateContentStream` yields chunks. We wrap them in a `ReadableStream`, `enqueue` each chunk, and return it as `text/plain`. After the stream finishes, the full answer is saved. If it fails, the question is deleted so it doesn't count against the 20-question limit.
- **Client:** `res.body.getReader()` → `TextDecoder` → append each chunk to the last message → render with `react-markdown`, which doesn't render raw HTML, so it's XSS-safe. v1 used `dangerouslySetInnerHTML` on LLM output.
- **Context window:** only the last 12 messages are sent, which keeps cost and latency bounded.
- `maxOutputTokens: 2048`, because "thinking" models count their reasoning tokens against this limit.

---

## 14. The frontend

- **Design system:** Tailwind CSS 4 (configured in CSS with `@theme`, no JS config) plus **shadcn/ui** components (copied into `src/components/ui`, built on Radix primitives for accessibility). Colour tokens are in `oklch` (perceptually uniform), with light and dark sets switched by `next-themes`. Fonts are Fraunces (headings) and Geist (body), self-hosted via `next/font`.
- **Analyze flow** (`AnalyzeFlow.tsx`): a small state machine (`pick → preview → analyzing`), drag & drop (`react-dropzone`), a **Take a selfie** option (`<input capture="user">` opens the front camera on phones), a face-guide oval, staged progress, and a specific recovery action for each error code.
- **Photo privacy on the report:** the thumbnail lives only in `sessionStorage`. `PhotoCard` reads it with `useSyncExternalStore`, which avoids a server/client hydration mismatch.
- **Credits badge:** `useCredits()` fetches `/api/me`, and `notifyCreditsChanged()` dispatches a window event so every badge refreshes after an analysis.
- **Marketing pages are static.** The header is a client component, so no server-side auth check forces pages to be dynamic. `/`, `/conditions/*`, `/about` and so on are pre-rendered.
- **SEO:** `pageMetadata()`, JSON-LD (WebApplication, FAQ, Breadcrumb), `sitemap.ts`, `robots.ts`, an Open Graph image generated with `next/og`, and the 15 condition guides pre-rendered with `generateStaticParams`.
- **Accessibility:** skip link, `aria-live` progress, labelled meters, keyboard-friendly Radix components, and a `prefers-reduced-motion` reset.

---

## 15. Security: what changed from v1 and why

| v1 problem | Risk | v2 fix |
|---|---|---|
| Payment webhook didn't verify signatures | Anyone could grant themselves a paid pass | Standard Webhooks HMAC verification + unique `payment_id` |
| Browser called ML `/chat` directly | Free, unlimited use of your Gemini key | Chat goes through an authenticated, rate-limited route |
| `NEXT_PUBLIC_ML_SERVICE_URL` | ML URL visible to everyone; `/predict` bypassed credits | Server-only `ML_SERVICE_URL` + `X-API-Key` |
| Guest limit stored in localStorage | Clear storage → unlimited free use | httpOnly cookie + salted IP hash, enforced server-side |
| Upload saved as `uploads/{filename}` | Path traversal, users overwriting each other, files never deleted | Decoded in memory, nothing on disk |
| Check credits, then increment later | Race condition → free analyses | Atomic conditional `UPDATE` |
| `dangerouslySetInnerHTML` on LLM text | XSS if the model outputs HTML | Structured JSON + `react-markdown` |
| ML errors still charged a credit | Users paying for failures | Automatic refunds |
| Fake `aggregateRating` in JSON-LD | Google penalties, dishonest | Removed |

---

## 16. Testing and verification

| Layer | How | Result |
|---|---|---|
| ONNX parity | `export_onnx.py` compares fastai vs ONNX | max Δp 2.9e-6 |
| ML API | `pytest` + FastAPI `TestClient` | 5 passed: health, auth, bad image, no face, real face |
| Web units | Vitest | 8 passed: labels in sync with the model, bands, schemas, plans |
| Types and lint | `tsc --noEmit`, ESLint (incl. React compiler rules) | clean |
| Build | `next build` | static marketing pages, dynamic app routes |
| End to end (local) | real ML service + local Postgres + real Gemini | guest flow, limit, demo caching, insights, chat streaming, signed webhook, credit race |

The test `conditions.test.ts` fails if the web app's condition content and the model's labels ever drift apart. That's a cheap guard between two repos.

---

## 17. Deployment and operations

1. **ML:** run `scripts/build_space.sh`, upload `dist/space/` to a Gradio Space on ZeroGPU hardware, add the `ML_API_KEY` secret → note its `*.hf.space` URL.
2. **DB:** Neon. Create a **backup branch**, then run `pnpm db:deploy`.
3. **Web:** Vercel with the env vars from the README. Remove the old `NEXT_PUBLIC_ML_SERVICE_URL` and `JWT_SECRET`.
4. **Webhooks:** Dodo → `/api/payment/webhook`; Clerk → `/api/webhooks/clerk` (`user.updated`, `user.deleted`).
5. **Smoke test:** open `/analyze`, try the demo, upload a selfie, ask a question, then do a test-mode purchase.

**Free-tier costs:** Hugging Face Space on ZeroGPU hardware (free; CPU inference uses no GPU quota), Vercel Hobby (free), Neon (free), Clerk (free up to its MAU limit), Gemini (free tier with rate limits; the fallback helps), and Dodo (charges per transaction only).

**Logs to watch:** Vercel function logs (`[ml]`, `[gemini]`, `[webhook]` prefixes) and the Space logs (`analyze ok top=… in …ms`).

---

## 18. Glossary of tools and libraries

| Tool | What it is | Where |
|---|---|---|
| **PyTorch** | Deep-learning framework (tensors, autograd) | Training, export only |
| **fastai** | High-level library on PyTorch: data loaders, augmentation, `fine_tune` | Training, export only |
| **ResNet-50** | 50-layer residual CNN, ImageNet pre-trained | The classifier |
| **ONNX / ONNX Runtime** | Portable model format / fast inference engine | `model.onnx`, `classifier.py` |
| **OpenCV + YuNet** | Computer-vision library + small face-detector CNN | `face.py` |
| **Pillow / NumPy** | Image decoding / array maths | Preprocessing |
| **FastAPI / Uvicorn** | Typed Python web framework / ASGI server | ML API |
| **pydantic(-settings)** | Data validation / typed env config | ML API |
| **pytest** | Python test runner | `tests/` |
| **Docker** | Container packaging | `Dockerfile` |
| **Hugging Face Spaces (Gradio, ZeroGPU)** | Free app hosting; GPU attached only to `@spaces.GPU` functions | ML hosting + public demo |
| **Gradio** | Python UI/API framework; `gr.api` exposes functions over HTTP | `space/gradio_app.py` |
| **Render** | Container hosting with a free tier | Docker fallback |
| **Git LFS** | Large-file storage for git | `*.onnx` |
| **Next.js 16** | React framework: SSR, routing, API routes | Web app |
| **React 19** | UI library (server + client components) | Web app |
| **TypeScript** | Typed JavaScript | Everywhere |
| **Tailwind CSS 4** | Utility-first CSS | Styling |
| **shadcn/ui + Radix** | Accessible, copy-in components | `components/ui` |
| **Zod 4** | Runtime schemas → types + JSON Schema | env, API input, Gemini output |
| **Prisma 7** | Typed ORM + migrations | `lib/db.ts`, `prisma/` |
| **PostgreSQL / Neon** | Relational database / serverless host | Data |
| **Clerk** | Hosted auth | Sign-in, users |
| **Dodo Payments** | Merchant of record, checkout + webhooks | Passes |
| **@google/genai** | Official Gemini SDK | `lib/gemini.ts` |
| **react-markdown** | Safe Markdown rendering | Chat answers |
| **browser-image-compression** | On-device resize/compress | Upload |
| **react-dropzone** | Drag & drop file input | Upload |
| **next-themes / sonner** | Dark mode / toast notifications | UI |
| **PostHog / GA / Vercel Analytics** | Product analytics | Optional |
| **Vitest / ESLint** | JS test runner / linter | Quality |
| **pnpm** | Fast, disk-efficient package manager | Web app |

---

## 19. Interview questions you should be ready for

**"Walk me through the architecture."** Two services. A stateless inference service on a Hugging Face Space (Gradio API, CPU ONNX inference), called server-to-server with an API key, and a Next.js app that owns auth, billing, persistence and LLM features. Splitting them lets the model scale to zero, and it keeps secrets and state in one place.

**"Why ONNX?"** It cut serve-time dependencies from about 2 GB to about 150 MB, gave faster cold starts and portability (even the browser), and removed unsafe pickle loading. I verified output parity to 3e-6 against the original fastai model.

**"How did you make sure the ONNX model gives the same results?"** I inspected the learner's validation transforms (resize to 256, centre-crop 224, ImageNet normalisation), re-implemented them in NumPy, and compared probabilities image by image.

**"How do you stop users getting free analyses?"** Credits are consumed with a conditional atomic UPDATE (tested with 12 concurrent requests). Guests are limited by an httpOnly cookie plus a salted IP hash. The ML API itself requires a server-side key.

**"How do you handle payments safely?"** Only signed webhooks grant access, never the redirect. HMAC signatures follow the Standard Webhooks spec, and a unique payment_id makes retries idempotent.

**"How do you make LLM output reliable?"** A JSON-schema constrained response, validated with Zod, cached per analysis, with a safety system prompt, a timeout and a model fallback. Rendering uses react-markdown, never raw HTML.

**"What are the model's limitations?"** Single-label softmax for a multi-label problem, sensitivity to lighting and makeup, uncalibrated confidence (hence the bands), and fairness depends on training-data diversity.

**"Why a Gradio Space on ZeroGPU if the model runs on CPU?"** It's the free compute option on Hugging Face. ZeroGPU only attaches a GPU to decorated functions, so CPU inference costs no quota, and the same pipeline can also run as FastAPI in Docker.

**"What happens when the free host is asleep?"** A wake ping when the analyze page opens, a 50 s server timeout (under Vercel Hobby's 60 s cap), a UI message after 9 s, and a specific `ML_UNAVAILABLE` error with a retry button. The user is refunded if it fails.

---

## 20. Where to take it next

- **Multi-label model** (sigmoid per class) plus a held-out evaluation report (per-class precision/recall and confusion matrix) in the ML README.
- **INT8 quantisation**, or **in-browser inference** with `onnxruntime-web`, so photos never leave the device.
- **Progress tracking:** compare two reports over time.
- **Calibration** (temperature scaling) so confidence values mean something.
- **Rate limiting** with Upstash for chat and insights at scale.
- **E2E tests** with Playwright for the upload → report flow.
- **Observability:** Sentry for errors, plus structured logs with request ids across both services.
