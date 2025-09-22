-- CreateEnum
CREATE TYPE "WithdrawStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Withdraw" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER,
    "agentId" INTEGER,
    "transferType" "TransferType" NOT NULL,
    "transferDetails" JSONB NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "ticket" INTEGER,
    "screenshot" TEXT,
    "status" "WithdrawStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Withdraw_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Withdraw" ADD CONSTRAINT "Withdraw_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Withdraw" ADD CONSTRAINT "Withdraw_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;