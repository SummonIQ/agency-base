-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "parentTaskId" TEXT;

-- CreateIndex
CREATE INDEX "Task_parentTaskId_idx" ON "public"."Task"("parentTaskId");

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "public"."Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
