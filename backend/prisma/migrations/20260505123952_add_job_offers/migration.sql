-- CreateEnum
CREATE TYPE "JobOfferStatus" AS ENUM ('draft', 'active', 'paused', 'closed');

-- CreateEnum
CREATE TYPE "WorkType" AS ENUM ('full_remote', 'hybrid', 'on_site');

-- CreateTable
CREATE TABLE "job_offers" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "speciality" "Speciality" NOT NULL,
    "experience_min" INTEGER,
    "tjm_client" DECIMAL(65,30) NOT NULL,
    "contract_duration" TEXT,
    "work_type" "WorkType" NOT NULL,
    "timezone_preference" TEXT,
    "start_date" TIMESTAMP(3),
    "status" "JobOfferStatus" NOT NULL DEFAULT 'draft',
    "is_anonymous" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "applications_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "job_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_offer_skills" (
    "job_offer_id" TEXT NOT NULL,
    "skill_id" TEXT NOT NULL,

    CONSTRAINT "job_offer_skills_pkey" PRIMARY KEY ("job_offer_id","skill_id")
);

-- AddForeignKey
ALTER TABLE "job_offers" ADD CONSTRAINT "job_offers_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offer_skills" ADD CONSTRAINT "job_offer_skills_job_offer_id_fkey" FOREIGN KEY ("job_offer_id") REFERENCES "job_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_offer_skills" ADD CONSTRAINT "job_offer_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
