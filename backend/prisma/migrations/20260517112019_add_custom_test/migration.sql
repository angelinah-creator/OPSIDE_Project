-- CreateEnum
CREATE TYPE "CustomTestStatus" AS ENUM ('pending', 'sent', 'in_progress', 'submitted', 'scored', 'expired');

-- CreateTable
CREATE TABLE "custom_tests" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "skills_tested" TEXT[],
    "difficulty" TEXT,
    "duration_minutes" INTEGER NOT NULL,
    "custom_instructions" TEXT,
    "threshold" INTEGER NOT NULL DEFAULT 75,
    "questions" JSONB,
    "answers" JSONB,
    "score" INTEGER,
    "score_details" JSONB,
    "status" "CustomTestStatus" NOT NULL DEFAULT 'pending',
    "retest_allowed" BOOLEAN NOT NULL DEFAULT true,
    "retest_used" BOOLEAN NOT NULL DEFAULT false,
    "started_at" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_tests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "custom_tests_match_id_key" ON "custom_tests"("match_id");

-- AddForeignKey
ALTER TABLE "custom_tests" ADD CONSTRAINT "custom_tests_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_tests" ADD CONSTRAINT "custom_tests_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_tests" ADD CONSTRAINT "custom_tests_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
