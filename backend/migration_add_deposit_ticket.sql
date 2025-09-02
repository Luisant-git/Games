-- Migration to add depositTicket field to Deposit table and tickets field to PlayerWallet table

-- Add depositTicket column to Deposit table
ALTER TABLE "Deposit" ADD COLUMN "depositTicket" TEXT;

-- Add tickets column to PlayerWallet table
ALTER TABLE "PlayerWallet" ADD COLUMN "tickets" TEXT[] DEFAULT '{}';