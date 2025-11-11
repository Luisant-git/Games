import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
  Patch,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SupportService } from './support.service';
import { CreateSupportDto } from './dto/create-support.dto';

@ApiTags('support')
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new support ticket' })
  @ApiResponse({ status: 201, description: 'Support ticket created successfully' })
  create(@Body() createSupportDto: CreateSupportDto, @Request() req) {
    return this.supportService.create(createSupportDto, req.user.id, req.user.type);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get support tickets for authenticated user' })
  @ApiResponse({ status: 200, description: 'Support tickets found' })
  findByUser(@Request() req) {
    return this.supportService.findByUser(req.user.id, req.user.type);
  }

  @Get('admin/all')
  @ApiOperation({ summary: 'Get all support tickets (admin only)' })
  @ApiResponse({ status: 200, description: 'All support tickets' })
  findAll(@Query('page') page: string, @Query('limit') limit: string) {
    return this.supportService.findAll(+page || 1, +limit || 10);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update support ticket status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.supportService.updateStatus(+id, status);
  }
}