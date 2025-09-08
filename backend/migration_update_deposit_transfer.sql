-- Migration to update Deposit table for transfer types
-- This migration safely transforms existing UTR-based deposits to the new transfer structure

-- Step 1: Add new columns
ALTER TABLE "Deposit" ADD COLUMN "transferType" TEXT;
ALTER TABLE "Deposit" ADD COLUMN "transferDetails" JSONB;

-- Step 2: Migrate existing data (UTR numbers become bank transfers)
UPDATE "Deposit" 
SET 
  "transferType" = 'BANK_TRANSFER',
  "transferDetails" = jsonb_build_object(
    'transactionId', "utrNumber",
    'accountNumber', '',
    'ifscCode', '',
    'bankName', '',
    'accountHolderName', ''
  )
WHERE "utrNumber" IS NOT NULL;

-- Step 3: Make new columns NOT NULL after data migration
ALTER TABLE "Deposit" ALTER COLUMN "transferType" SET NOT NULL;
ALTER TABLE "Deposit" ALTER COLUMN "transferDetails" SET NOT NULL;

-- Step 4: Drop old column
ALTER TABLE "Deposit" DROP COLUMN "utrNumber";

-- Step 5: Create enum type for TransferType
CREATE TYPE "TransferType" AS ENUM ('BANK_TRANSFER', 'UPI_TRANSFER');

-- Step 6: Update column to use enum type
ALTER TABLE "Deposit" ALTER COLUMN "transferType" TYPE "TransferType" USING "transferType"::"TransferType";