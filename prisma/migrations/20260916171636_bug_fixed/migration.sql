/*
  Warnings:

  - Added the required column `order` to the `Slide` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Slide" ADD COLUMN     "order" INTEGER NOT NULL;
