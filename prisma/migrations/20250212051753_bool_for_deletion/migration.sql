/*
  Warnings:

  - You are about to drop the column `root_id` on the `LikesOnPost` table. All the data in the column will be lost.
  - You are about to drop the column `root_id` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the `LikeRoot` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id,post_id]` on the table `LikesOnPost` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "LikesOnPost" DROP CONSTRAINT "LikesOnPost_root_id_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_root_id_fkey";

-- DropIndex
DROP INDEX "LikesOnPost_user_id_post_id_root_id_key";

-- AlterTable
ALTER TABLE "LikesOnPost" DROP COLUMN "root_id";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "root_id",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "LikeRoot";

-- CreateIndex
CREATE UNIQUE INDEX "LikesOnPost_user_id_post_id_key" ON "LikesOnPost"("user_id", "post_id");
