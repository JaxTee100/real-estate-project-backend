/*
  Warnings:

  - You are about to drop the column `images` on the `House` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "House" DROP COLUMN "images";

-- CreateTable
CREATE TABLE "HouseImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,

    CONSTRAINT "HouseImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HouseImage" ADD CONSTRAINT "HouseImage_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE CASCADE ON UPDATE CASCADE;
