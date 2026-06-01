-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "JobBoard" ADD VALUE 'LINKEDIN';
ALTER TYPE "JobBoard" ADD VALUE 'INDEED';
ALTER TYPE "JobBoard" ADD VALUE 'GLASSDOOR';
ALTER TYPE "JobBoard" ADD VALUE 'ZIPRECRUITER';
ALTER TYPE "JobBoard" ADD VALUE 'ANGELLIST';
ALTER TYPE "JobBoard" ADD VALUE 'WELLFOUND';
ALTER TYPE "JobBoard" ADD VALUE 'MONSTER';
ALTER TYPE "JobBoard" ADD VALUE 'DICE';
ALTER TYPE "JobBoard" ADD VALUE 'FLEXJOBS';
ALTER TYPE "JobBoard" ADD VALUE 'REMOTE_OK';
ALTER TYPE "JobBoard" ADD VALUE 'WE_WORK_REMOTELY';
ALTER TYPE "JobBoard" ADD VALUE 'COMPANY_DIRECT';
ALTER TYPE "JobBoard" ADD VALUE 'OTHER';
