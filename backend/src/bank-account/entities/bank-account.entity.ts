export class BankAccount {
  id: number;
  playerId?: number;
  agentId?: number;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountHolderName: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}