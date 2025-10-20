-- Add status and rating columns to users table
ALTER TABLE "users" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'Active';
ALTER TABLE "users" ADD COLUMN "rating" INTEGER NOT NULL DEFAULT 5;
