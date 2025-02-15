/*
  Warnings:

  - Added the required column `parent_id` to the `LikesOnPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LikesOnPost" ADD COLUMN     "parent_id" INTEGER NOT NULL;

-- RenameForeignKey
ALTER TABLE "LikesOnPost" RENAME CONSTRAINT "LikesOnPost_post_id_fkey" TO "like_post_fk";

-- AddForeignKey
ALTER TABLE "LikesOnPost" ADD CONSTRAINT "like_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
