/*
  Warnings:

  - Changed the type of `country` on the `candidate_profiles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `country` on the `client_profiles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Country" AS ENUM ('kenya', 'nigeria', 'egypte', 'maroc', 'tunisie', 'madagascar', 'senegal', 'maurice');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Currency" ADD VALUE 'KES';
ALTER TYPE "Currency" ADD VALUE 'NGN';
ALTER TYPE "Currency" ADD VALUE 'EGP';
ALTER TYPE "Currency" ADD VALUE 'MUR';

-- AlterTable
ALTER TABLE "candidate_profiles" 
ALTER COLUMN "country" TYPE "Country" USING (
  CASE 
    WHEN lower("country") IN ('kenya') THEN 'kenya'::"Country"
    WHEN lower("country") IN ('nigeria', 'nugeria') THEN 'nigeria'::"Country"
    WHEN lower("country") IN ('egypte', 'egypt') THEN 'egypte'::"Country"
    WHEN lower("country") IN ('maroc', 'morocco') THEN 'maroc'::"Country"
    WHEN lower("country") IN ('tunisie', 'tunisia') THEN 'tunisie'::"Country"
    WHEN lower("country") IN ('madagascar') THEN 'madagascar'::"Country"
    WHEN lower("country") IN ('senegal') THEN 'senegal'::"Country"
    WHEN lower("country") IN ('maurice', 'mauritius') THEN 'maurice'::"Country"
    ELSE 'madagascar'::"Country"
  END
);

-- AlterTable
ALTER TABLE "client_profiles" 
ALTER COLUMN "country" TYPE "Country" USING (
  CASE 
    WHEN lower("country") IN ('kenya') THEN 'kenya'::"Country"
    WHEN lower("country") IN ('nigeria', 'nugeria') THEN 'nigeria'::"Country"
    WHEN lower("country") IN ('egypte', 'egypt') THEN 'egypte'::"Country"
    WHEN lower("country") IN ('maroc', 'morocco') THEN 'maroc'::"Country"
    WHEN lower("country") IN ('tunisie', 'tunisia') THEN 'tunisie'::"Country"
    WHEN lower("country") IN ('madagascar') THEN 'madagascar'::"Country"
    WHEN lower("country") IN ('senegal') THEN 'senegal'::"Country"
    WHEN lower("country") IN ('maurice', 'mauritius') THEN 'maurice'::"Country"
    ELSE 'madagascar'::"Country"
  END
);
