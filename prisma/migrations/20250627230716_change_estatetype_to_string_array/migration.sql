/*
  Warnings:

  - The `estatetype` column on the `House` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EstateType" AS ENUM ('HOUSE', 'CONDO', 'APARTMENT', 'COMMERCIAL');

-- AlterTable
ALTER TABLE "House" DROP COLUMN "estatetype",
ADD COLUMN     "estatetype" TEXT[];
