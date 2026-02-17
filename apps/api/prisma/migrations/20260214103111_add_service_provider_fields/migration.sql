-- AlterTable
ALTER TABLE "ServiceProviderProfile" ADD COLUMN     "workingDays" TEXT[],
ADD COLUMN     "workingHoursEnd" TEXT,
ADD COLUMN     "workingHoursStart" TEXT;
