-- DropForeignKey
ALTER TABLE "LikesOnPost" DROP CONSTRAINT "LikesOnPost_post_id_fkey";

-- AddForeignKey
ALTER TABLE "LikesOnPost" ADD CONSTRAINT "LikesOnPost_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
