-- AlterTable
ALTER TABLE "public"."ActionTask" ADD COLUMN     "parentTaskId" TEXT;

-- CreateIndex
CREATE INDEX "ActionTask_parentTaskId_idx" ON "public"."ActionTask"("parentTaskId");

-- AddForeignKey
ALTER TABLE "public"."ActionTask" ADD CONSTRAINT "ActionTask_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "public"."ActionTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
