/*
  Warnings:

  - A unique constraint covering the columns `[gameId,position]` on the table `Square` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gameId` to the `Square` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Square_playId_position_key";

-- AlterTable
ALTER TABLE "Square" ADD COLUMN     "gameId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Square_gameId_idx" ON "Square"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "Square_gameId_position_key" ON "Square"("gameId", "position");

-- AddForeignKey
ALTER TABLE "Square" ADD CONSTRAINT "Square_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
