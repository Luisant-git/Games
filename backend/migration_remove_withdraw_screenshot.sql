-- Migration: Remove screenshot field from Withdraw table
-- Run this SQL command in your PostgreSQL database

ALTER TABLE "Withdraw" DROP COLUMN IF EXISTS "screenshot";
