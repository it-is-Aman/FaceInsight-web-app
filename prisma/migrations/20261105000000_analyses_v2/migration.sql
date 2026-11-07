-- v2: replace prediction_history with analyses (+ chat_messages), make payments idempotent.
-- Existing prediction history is copied into "analyses" before the old table is dropped.

-- 1. New tables ---------------------------------------------------------------
CREATE TABLE "analyses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "guest_id" TEXT,
    "ip_hash" TEXT,
    "source" TEXT NOT NULL DEFAULT 'upload',
    "sample_id" TEXT,
    "predictions" JSONB NOT NULL,
    "face_confidence" DOUBLE PRECISION,
    "model_version" TEXT,
    "insights" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analyses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "analysis_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- 2. Copy legacy history ------------------------------------------------------
-- Old rows stored JSON.stringify([{ condition, confidence, ... }]) as TEXT.
INSERT INTO "analyses" ("id", "user_id", "source", "predictions", "model_version", "created_at")
SELECT
    ph."prediction_id",
    ph."user_id",
    'upload',
    COALESCE(
        (SELECT jsonb_agg(jsonb_build_object(
                    'label', COALESCE(e->>'condition', e->>'disease'),
                    'confidence', (e->>'confidence')::double precision))
         FROM jsonb_array_elements(ph."prediction_result"::jsonb) AS e),
        '[]'::jsonb),
    'legacy-fastai',
    ph."created_at"
FROM "prediction_history" ph
WHERE ph."prediction_result" IS NOT NULL
  AND jsonb_typeof(ph."prediction_result"::jsonb) = 'array';

-- 3. Drop legacy table ---------------------------------------------------------
ALTER TABLE "prediction_history" DROP CONSTRAINT "prediction_history_user_id_fkey";
DROP TABLE "prediction_history";

ALTER TABLE "users" DROP COLUMN "password_hash";

-- 4. Subscriptions: one row per payment ---------------------------------------
-- The old webhook was not idempotent, so a retried webhook may have granted a pass twice.
-- Keep the earliest row for each payment_id before adding the unique constraint.
DELETE FROM "subscriptions" a
USING "subscriptions" b
WHERE a."payment_id" IS NOT NULL
  AND a."payment_id" = b."payment_id"
  AND (a."purchase_date", a."subscription_id") > (b."purchase_date", b."subscription_id");

DROP INDEX "subscriptions_status_idx";
DROP INDEX "subscriptions_user_id_idx";
CREATE UNIQUE INDEX "subscriptions_payment_id_key" ON "subscriptions"("payment_id");
CREATE INDEX "subscriptions_user_id_status_idx" ON "subscriptions"("user_id", "status");

-- 5. Indexes & FKs --------------------------------------------------------------
CREATE INDEX "analyses_user_id_created_at_idx" ON "analyses"("user_id", "created_at");
CREATE INDEX "analyses_guest_id_idx" ON "analyses"("guest_id");
CREATE INDEX "analyses_ip_hash_created_at_idx" ON "analyses"("ip_hash", "created_at");
CREATE INDEX "analyses_sample_id_idx" ON "analyses"("sample_id");
CREATE INDEX "chat_messages_analysis_id_created_at_idx" ON "chat_messages"("analysis_id", "created_at");

ALTER TABLE "analyses" ADD CONSTRAINT "analyses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
