# Deposit Transfer API Documentation

## Overview
Updated deposit system supporting Bank Transfer and UPI Transfer with specific validation for each transfer type.

## Transfer Types

### Bank Transfer
Required fields in `transferDetails`:
- `accountNumber`: Bank account number (9-18 digits)
- `ifscCode`: IFSC code (format: ABCD0123456)
- `bankName`: Name of the bank
- `accountHolderName`: Account holder's name
- `transactionId`: Transaction reference ID

### UPI Transfer
Required fields in `transferDetails`:
- `upiId`: UPI ID (format: user@app)
- `transactionId`: UPI transaction ID
- `upiAppName`: UPI app name enum (GOOGLE_PAY or PHONE_PE)

## API Endpoints

### Create Deposit
```
POST /deposits
Authorization: Bearer <token>

Body:
{
  "transferType": "BANK_TRANSFER",
  "transferDetails": {
    "accountNumber": "1234567890",
    "ifscCode": "SBIN0001234",
    "bankName": "State Bank of India",
    "accountHolderName": "John Doe",
    "transactionId": "TXN123456789"
  },
  "amount": 1000.50,
  "ticket": 123
}
```

### UPI Transfer Example
```
POST /deposits
Authorization: Bearer <token>

Body:
{
  "transferType": "UPI_TRANSFER",
  "transferDetails": {
    "upiId": "user@paytm",
    "transactionId": "UPI123456789",
    "upiAppName": "GOOGLE_PAY"
  },
  "amount": 500.00
}
```

### Update Deposit
```
PATCH /deposits/:id

Body:
{
  "transferType": "UPI_TRANSFER",
  "transferDetails": {
    "upiId": "newuser@phonepe",
    "transactionId": "UPI987654321",
    "upiAppName": "PHONE_PE"
  },
  "amount": 750.00
}
```

## Response Format
```json
{
  "success": true,
  "message": "Deposit created successfully",
  "data": {
    "id": 1,
    "playerId": 1,
    "transferType": "BANK_TRANSFER",
    "transferDetails": {
      "accountNumber": "1234567890",
      "ifscCode": "SBIN0001234",
      "bankName": "State Bank of India",
      "accountHolderName": "John Doe",
      "transactionId": "TXN123456789"
    },
    "amount": 1000.50,
    "status": "PENDING",
    "ticket": 123,
    "createdAt": "2024-01-20T10:30:00Z",
    "updatedAt": "2024-01-20T10:30:00Z",
    "player": {
      "id": 1,
      "username": "player1",
      "phone": "9876543210"
    }
  }
}
```

## Validation Rules

### Bank Transfer Validation
- Account Number: 9-18 digits only
- IFSC Code: Must match pattern ABCD0123456 (4 letters + 0 + 6 alphanumeric)
- All fields are required and cannot be empty

### UPI Transfer Validation
- UPI ID: Must match pattern user@app (alphanumeric + @ + app name)
- UPI App Name: Must be either GOOGLE_PAY or PHONE_PE
- All fields are required and cannot be empty

## Migration Notes
- Existing UTR-based deposits are automatically migrated as Bank Transfers
- Old `utrNumber` becomes `transactionId` in `transferDetails`
- Other bank details are set as empty strings for existing records