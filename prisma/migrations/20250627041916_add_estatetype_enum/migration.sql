/*
  Warnings:

  - Changed the type of `estatetype` on the `House` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EstateType" AS ENUM ('HOUSE', 'CONDO', 'APARTMENT', 'COMMERCIAL');

-- AlterTable
ALTER TABLE "House" DROP COLUMN "estatetype",
ADD COLUMN     "estatetype" "EstateType" NOT NULL;
