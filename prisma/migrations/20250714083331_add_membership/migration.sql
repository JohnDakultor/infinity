/*
  Warnings:

  - Added the required column `expirationDate` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `membershipType` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "expirationDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "membershipType" TEXT NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;
