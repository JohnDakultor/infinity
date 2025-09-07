/*
  Warnings:

  - You are about to drop the column `email` on the `Client` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contactNumber]` on the table `Client` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Client_email_key";

-- AlterTable
ALTER TABLE "public"."Client" DROP COLUMN "email",
ADD COLUMN     "contactNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Client_contactNumber_key" ON "public"."Client"("contactNumber");
