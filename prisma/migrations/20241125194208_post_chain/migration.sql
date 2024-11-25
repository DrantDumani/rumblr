-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "prev_id" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "about" VARCHAR(400);

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_prev_id_fkey" FOREIGN KEY ("prev_id") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
