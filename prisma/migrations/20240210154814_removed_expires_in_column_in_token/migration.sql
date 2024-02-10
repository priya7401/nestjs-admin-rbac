/*
  Warnings:

  - You are about to drop the column `expires_in` on the `Token` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Token" DROP COLUMN "expires_in";
