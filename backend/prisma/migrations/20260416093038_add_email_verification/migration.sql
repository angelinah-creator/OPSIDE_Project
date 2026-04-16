-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'pending';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verification_token" TEXT,
ALTER COLUMN "first_name" DROP NOT NULL,
ALTER COLUMN "last_name" DROP NOT NULL;

-- DropEnum
DROP TYPE "SkillCategory";
