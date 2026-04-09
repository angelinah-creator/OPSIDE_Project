/*
  Warnings:

  - The values [full_time,part_time,independent,internship,apprenticeship] on the enum `EmploymentType` will be removed. If these variants are still used in the database, this will fail.
  - The values [candidate] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - The values [design] on the enum `Speciality` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `first_name` on the `candidate_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `candidate_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `contract_template_url` on the `client_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `nda_template_url` on the `client_profiles` table. All the data in the column will be lost.
  - The `company_size` column on the `client_profiles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `end_date` on the `educations` table. All the data in the column will be lost.
  - You are about to drop the column `field_of_study` on the `educations` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `educations` table. All the data in the column will be lost.
  - The `level` column on the `educations` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `end_date` on the `experiences` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `experiences` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `education_media` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `experience_media` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `start_month` to the `educations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_year` to the `educations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_month` to the `experiences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_year` to the `experiences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('bac', 'bac_plus_2', 'bac_plus_3', 'bac_plus_4', 'bac_plus_5', 'doctorat', 'autre');

-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('size_1_10', 'size_11_50', 'size_51_200', 'size_200_plus');

-- AlterEnum
BEGIN;
CREATE TYPE "EmploymentType_new" AS ENUM ('temps_plein', 'temps_partiel', 'freelance', 'independant', 'stage_alternance', 'apprentissage');
ALTER TABLE "experiences" ALTER COLUMN "employment_type" TYPE "EmploymentType_new" USING ("employment_type"::text::"EmploymentType_new");
ALTER TYPE "EmploymentType" RENAME TO "EmploymentType_old";
ALTER TYPE "EmploymentType_new" RENAME TO "EmploymentType";
DROP TYPE "public"."EmploymentType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('candidat', 'client', 'admin');
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Speciality_new" AS ENUM ('frontend', 'backend', 'fullstack', 'mobile', 'devops', 'data');
ALTER TABLE "candidate_profiles" ALTER COLUMN "speciality" TYPE "Speciality_new" USING ("speciality"::text::"Speciality_new");
ALTER TYPE "Speciality" RENAME TO "Speciality_old";
ALTER TYPE "Speciality_new" RENAME TO "Speciality";
DROP TYPE "public"."Speciality_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "education_media" DROP CONSTRAINT "education_media_education_id_fkey";

-- DropForeignKey
ALTER TABLE "experience_media" DROP CONSTRAINT "experience_media_experience_id_fkey";

-- AlterTable
ALTER TABLE "candidate_profiles" DROP COLUMN "first_name",
DROP COLUMN "last_name",
ALTER COLUMN "bio" SET DATA TYPE TEXT,
ALTER COLUMN "daily_rate" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "client_profiles" DROP COLUMN "contract_template_url",
DROP COLUMN "nda_template_url",
ADD COLUMN     "logo_public_id" TEXT,
DROP COLUMN "company_size",
ADD COLUMN     "company_size" "CompanySize";

-- AlterTable
ALTER TABLE "educations" DROP COLUMN "end_date",
DROP COLUMN "field_of_study",
DROP COLUMN "start_date",
ADD COLUMN     "end_month" INTEGER,
ADD COLUMN     "end_year" INTEGER,
ADD COLUMN     "field" TEXT,
ADD COLUMN     "is_current" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "start_month" INTEGER NOT NULL,
ADD COLUMN     "start_year" INTEGER NOT NULL,
DROP COLUMN "level",
ADD COLUMN     "level" "EducationLevel",
ALTER COLUMN "description" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "experiences" DROP COLUMN "end_date",
DROP COLUMN "start_date",
ADD COLUMN     "end_month" INTEGER,
ADD COLUMN     "end_year" INTEGER,
ADD COLUMN     "is_current" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "start_month" INTEGER NOT NULL,
ADD COLUMN     "start_year" INTEGER NOT NULL,
ALTER COLUMN "description" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "is_revoked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "updated_at",
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT NOT NULL;

-- DropTable
DROP TABLE "education_media";

-- DropTable
DROP TABLE "experience_media";

-- CreateTable
CREATE TABLE "experience_medias" (
    "id" TEXT NOT NULL,
    "experience_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "media_type" TEXT NOT NULL,
    "public_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "experience_medias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_medias" (
    "id" TEXT NOT NULL,
    "education_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "media_type" TEXT NOT NULL,
    "public_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "education_medias_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "experience_medias" ADD CONSTRAINT "experience_medias_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education_medias" ADD CONSTRAINT "education_medias_education_id_fkey" FOREIGN KEY ("education_id") REFERENCES "educations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
