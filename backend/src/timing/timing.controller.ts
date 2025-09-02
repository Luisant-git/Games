import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TimingService } from './timing.service';
import { CreateTimingDto } from './dto/create-timing.dto';

@Controller('timing')
export class TimingController {
  constructor(private readonly timingService: TimingService) {}

  @Post()
  create(@Body() createTimingDto: CreateTimingDto) {
    return this.timingService.create(createTimingDto);
  }

  @Get()
  findAll() {
    return this.timingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.timingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTimingDto: CreateTimingDto) {
    return this.timingService.update(+id, updateTimingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.timingService.remove(+id);
  }
}