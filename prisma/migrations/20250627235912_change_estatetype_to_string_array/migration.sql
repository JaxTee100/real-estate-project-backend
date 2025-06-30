/*
  Warnings:

  - The `estatetype` column on the `House` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "House" DROP COLUMN "estatetype",
ADD COLUMN     "estatetype" "EstateType"[];
