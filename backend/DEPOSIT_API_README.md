# Deposit REST API Documentation

## Overview
Complete REST CRUD API for deposit management with JWT authentication and Swagger documentation.

## Features
- ✅ JWT Token Authentication (All endpoints protected)
- ✅ Complete CRUD operations
- ✅ Swagger/OpenAPI documentation
- ✅ Input validation with class-validator
- ✅ Prisma ORM integration
- ✅ TypeScript support

## API Endpoints

### Base URL: `/deposits`
All endpoints require Bearer token authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/deposits` | Create new deposit |
| GET | `/deposits` | Get all deposits |
| GET | `/deposits/:id` | Get deposit by ID |
| GET | `/deposits/player/:playerId` | Get deposits by player ID |
| PATCH | `/deposits/:id` | Update deposit |
| PATCH | `/deposits/:id/status` | Update deposit status |
| DELETE | `/deposits/:id` | Delete deposit |

## Request/Response Examples

### Create Deposit
```bash
POST /deposits
Authorization: Bearer <token>
Content-Type: application/json

{
  "playerId": 1,
  "utrNumber": "UTR123456789",
  "amount": 1000.50
}
```

### Update Deposit Status
```bash
PATCH /deposits/1/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "COMPLETED"
}
```

## Deposit Status Enum
- `PENDING` - Initial status
- `COMPLETED` - Successfully processed
- `FAILED` - Processing failed

## Authentication
All endpoints require JWT Bearer token:
```
Authorization: Bearer <your-jwt-token>
```

## Swagger Documentation
Access interactive API docs at: `http://localhost:4020/api`

## Files Created/Modified
- `src/deposit/entities/deposit.entity.ts` - Entity with Swagger decorators
- `src/deposit/dto/create-deposit.dto.ts` - Create DTO with validation
- `src/deposit/dto/update-deposit.dto.ts` - Update DTO
- `src/deposit/dto/update-deposit-status.dto.ts` - Status update DTO
- `src/deposit/deposit.controller.ts` - REST controller with auth & Swagger
- `src/deposit/deposit.service.ts` - Business logic with Prisma
- `src/deposit/deposit.module.ts` - Module configuration

## Usage
1. Start the server: `npm run start:dev`
2. Get JWT token from `/auth/login`
3. Use token in Authorization header for deposit endpoints
4. View API docs at `http://localhost:4020/api`