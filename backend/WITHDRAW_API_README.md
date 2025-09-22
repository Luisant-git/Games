# Withdraw API Documentation

## Overview
The Withdraw API allows players and agents to create and manage withdrawal requests with support for bank transfers and UPI payments.

## Endpoints

### 1. Create Withdraw Request
**POST** `/withdraws`

Creates a new withdrawal request for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "transferType": "BANK_TRANSFER",
  "transferDetails": {
    "accountNumber": "1234567890",
    "ifscCode": "SBIN0001234",
    "bankName": "State Bank of India",
    "accountHolderName": "John Doe"
  },
  "amount": 1000.50,
  "screenshot": "https://example.com/screenshot.jpg"
}
```

**UPI Transfer Example:**
```json
{
  "transferType": "UPI_TRANSFER",
  "transferDetails": {
    "upiId": "user@paytm",
    "upiAppName": "GOOGLE_PAY"
  },
  "amount": 500.00
}
```

### 2. Get All Withdraws
**GET** `/withdraws`

Returns all withdrawal requests (admin access).

### 3. Get Withdraw by ID
**GET** `/withdraws/:id`

Returns a specific withdrawal request by ID.

### 4. Get Player Withdraws
**GET** `/withdraws/player/:playerId`

Returns all withdrawal requests for a specific player.

### 5. Get Agent Withdraws
**GET** `/withdraws/agent/:agentId`

Returns all withdrawal requests for a specific agent.

### 6. Update Withdraw
**PATCH** `/withdraws/:id`

Updates withdrawal request details.

### 7. Update Withdraw Status
**PATCH** `/withdraws/:id/status`

Updates the status of a withdrawal request.

**Request Body:**
```json
{
  "status": "COMPLETED",
  "ticket": 123
}
```

### 8. Delete Withdraw
**DELETE** `/withdraws/:id`

Deletes a withdrawal request.

## Transfer Types

### Bank Transfer
Required fields in `transferDetails`:
- `accountNumber`: Bank account number (9-18 digits)
- `ifscCode`: IFSC code (format: ABCD0123456)
- `bankName`: Name of the bank
- `accountHolderName`: Account holder's name

### UPI Transfer
Required fields in `transferDetails`:
- `upiId`: UPI ID (format: user@app)
- `upiAppName`: UPI app name (GOOGLE_PAY, PHONE_PE)

## Withdraw Status
- `PENDING`: Initial status when withdraw is created
- `COMPLETED`: Withdraw has been processed and amount deducted from wallet
- `FAILED`: Withdraw processing failed
- `CANCELLED`: Withdraw was cancelled

## Validation Rules
1. User must have sufficient balance for withdrawal
2. Transfer details must be valid based on transfer type
3. Amount must be positive
4. Balance is deducted only when status changes to COMPLETED

## Error Responses
- `400 Bad Request`: Invalid input data or insufficient balance
- `401 Unauthorized`: Invalid or missing JWT token
- `404 Not Found`: Withdraw request not found
- `500 Internal Server Error`: Server error

## Example Response
```json
{
  "success": true,
  "message": "Withdraw request created successfully",
  "data": {
    "id": 1,
    "playerId": 1,
    "transferType": "BANK_TRANSFER",
    "transferDetails": {
      "accountNumber": "1234567890",
      "ifscCode": "SBIN0001234",
      "bankName": "State Bank of India",
      "accountHolderName": "John Doe"
    },
    "amount": 1000.50,
    "status": "PENDING",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "player": {
      "id": 1,
      "username": "player1",
      "phone": "1234567890"
    }
  }
}
```