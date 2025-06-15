/*
  Warnings:

  - Added the required column `about` to the `House` table without a default value. This is not possible if the table is not empty.
  - Added the required column `area` to the `House` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "House" ADD COLUMN     "about" TEXT NOT NULL,
ADD COLUMN     "area" INTEGER NOT NULL,
ADD COLUMN     "features" TEXT[];
