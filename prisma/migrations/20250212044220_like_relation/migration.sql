/*
  Warnings:

  - A unique constraint covering the columns `[user_id,post_id,root_id]` on the table `LikesOnPost` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `root_id` to the `LikesOnPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `root_id` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "LikesOnPost_user_id_post_id_key";

-- AlterTable
ALTER TABLE "LikesOnPost" ADD COLUMN     "root_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "root_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "LikeRoot" (
    "id" INTEGER GENERATED ALWAYS AS IDENTITY,

    CONSTRAINT "LikeRoot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LikesOnPost_user_id_post_id_root_id_key" ON "LikesOnPost"("user_id", "post_id", "root_id");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_root_id_fkey" FOREIGN KEY ("root_id") REFERENCES "LikeRoot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikesOnPost" ADD CONSTRAINT "LikesOnPost_root_id_fkey" FOREIGN KEY ("root_id") REFERENCES "LikeRoot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
