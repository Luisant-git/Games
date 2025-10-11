import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BankAccountService } from './bank-account.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('bank-accounts')
@Controller('bank-accounts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BankAccountController {
  constructor(private readonly bankAccountService: BankAccountService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new bank account' })
  @ApiResponse({ status: 201, description: 'Bank account added successfully.' })
  create(@Body() createBankAccountDto: CreateBankAccountDto, @Request() req) {
    const userId = req.user.id;
    const userType = req.user.type === 'agent' ? 'agent' : 'player';
    return this.bankAccountService.create(createBankAccountDto, userId, userType);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bank accounts for current user' })
  @ApiResponse({ status: 200, description: 'Return all bank accounts.' })
  findAll(@Request() req) {
    const userId = req.user.id;
    const userType = req.user.type === 'agent' ? 'agent' : 'player';
    return this.bankAccountService.findByUser(userId, userType);
  }

  @Patch(':id/default')
  @ApiOperation({ summary: 'Set bank account as default' })
  @ApiResponse({ status: 200, description: 'Default bank account updated successfully.' })
  setDefault(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.id;
    const userType = req.user.type === 'agent' ? 'agent' : 'player';
    return this.bankAccountService.setDefault(id, userId, userType);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a bank account' })
  @ApiResponse({ status: 200, description: 'Bank account deleted successfully.' })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.id;
    const userType = req.user.type === 'agent' ? 'agent' : 'player';
    return this.bankAccountService.remove(id, userId, userType);
  }
}