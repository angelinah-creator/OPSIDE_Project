-- AlterEnum
ALTER TYPE "EducationLevel" ADD VALUE 'bac_plus_8';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EmploymentType" ADD VALUE 'stage';
ALTER TYPE "EmploymentType" ADD VALUE 'alternance';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Speciality" ADD VALUE 'design';
ALTER TYPE "Speciality" ADD VALUE 'other';

-- AlterTable
ALTER TABLE "candidate_profiles" ADD COLUMN     "custom_speciality" TEXT;

-- AlterTable
ALTER TABLE "educations" ADD COLUMN     "custom_level" TEXT;
