-- CreateEnum
CREATE TYPE "TestType" AS ENUM ('platform', 'client');

-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('pending', 'in_progress', 'submitted', 'scored', 'expired');

-- CreateTable
CREATE TABLE "tests" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "type" "TestType" NOT NULL,
    "skills_tested" TEXT[],
    "speciality" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "answers" JSONB,
    "score" INTEGER,
    "score_details" JSONB,
    "duration_minutes" INTEGER NOT NULL,
    "started_at" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3),
    "status" "TestStatus" NOT NULL DEFAULT 'pending',
    "ai_model" TEXT,
    "ai_generation_prompt" TEXT,
    "ai_evaluation_prompt" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tests" ADD CONSTRAINT "tests_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
