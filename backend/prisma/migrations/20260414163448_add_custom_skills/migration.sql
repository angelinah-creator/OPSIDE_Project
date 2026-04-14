-- DropIndex
DROP INDEX IF EXISTS "skills_name_key";

-- AlterTable
ALTER TABLE "skills" ADD COLUMN "is_custom" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "owner_id" TEXT;

-- AlterTable
ALTER TABLE "skills" ALTER COLUMN "category" TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_owner_id_key" ON "skills"("name", "owner_id");

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
