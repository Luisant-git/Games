import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ResultService } from './result.service';
import { CreateResultDto } from './dto/create-result.dto';

@ApiTags('results')
@Controller('results')
export class ResultController {
  constructor(private readonly resultService: ResultService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new result' })
  @ApiResponse({ status: 201, description: 'Result created successfully' })
  create(@Body() createResultDto: CreateResultDto) {
    return this.resultService.create(createResultDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all results' })
  @ApiResponse({ status: 200, description: 'Results retrieved successfully' })
  findAll() {
    return this.resultService.findAll();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete result' })
  @ApiResponse({ status: 200, description: 'Result deleted successfully' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.resultService.remove(id);
  }
}