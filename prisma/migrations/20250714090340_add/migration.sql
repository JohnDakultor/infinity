/*
  Warnings:

  - A unique constraint covering the columns `[cardId]` on the table `Client` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "cardId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Client_cardId_key" ON "Client"("cardId");
