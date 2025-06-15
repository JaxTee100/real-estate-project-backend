/*
  Warnings:

  - Made the column `Estatetype` on table `House` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "House" ALTER COLUMN "Estatetype" SET NOT NULL;
