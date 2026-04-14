-- AlterEnum
BEGIN;
CREATE TYPE "Availability_new" AS ENUM ('immediate', 'two_weeks', 'one_month', 'three_months', 'unavailable');
ALTER TABLE "candidate_profiles" ALTER COLUMN "availability" TYPE "Availability_new" USING ("availability"::text::"Availability_new");
ALTER TYPE "Availability" RENAME TO "Availability_old";
ALTER TYPE "Availability_new" RENAME TO "Availability";
DROP TYPE "public"."Availability_old";
COMMIT;
