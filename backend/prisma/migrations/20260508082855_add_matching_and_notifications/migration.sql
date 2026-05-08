-- CreateEnum
CREATE TYPE "CandidatureStatus" AS ENUM ('pending', 'matched', 'rejected', 'withdrawn');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('pending_candidate', 'pending_client', 'confirmed', 'rejected');

-- CreateEnum
CREATE TYPE "MatchInitiatedBy" AS ENUM ('candidate', 'client');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('new_application', 'match_request', 'match_confirmed', 'match_rejected', 'test_result', 'sourcing_invitation');

-- CreateTable
CREATE TABLE "candidatures" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "job_offer_id" TEXT NOT NULL,
    "status" "CandidatureStatus" NOT NULL DEFAULT 'pending',
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT,

    CONSTRAINT "candidatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "job_offer_id" TEXT,
    "status" "MatchStatus" NOT NULL DEFAULT 'pending_candidate',
    "initiated_by" "MatchInitiatedBy" NOT NULL,
    "matched_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "rejected_by" "Role",

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "email_sent" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "candidatures" ADD CONSTRAINT "candidatures_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidatures" ADD CONSTRAINT "candidatures_job_offer_id_fkey" FOREIGN KEY ("job_offer_id") REFERENCES "job_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_job_offer_id_fkey" FOREIGN KEY ("job_offer_id") REFERENCES "job_offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
