/*
  Warnings:

  - You are about to drop the column `rentalOwnerId` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `serviceProviderId` on the `Document` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_rentalOwnerId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_serviceProviderId_fkey";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "rentalOwnerId",
DROP COLUMN "serviceProviderId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
