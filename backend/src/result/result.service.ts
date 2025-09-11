import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateResultDto } from './dto/create-result.dto';

@Injectable()
export class ResultService {
  constructor(private prisma: PrismaService) {}

  async create(createResultDto: CreateResultDto) {
    return this.prisma.result.create({
      data: {
        ...createResultDto,
        date: new Date(createResultDto.date)
      }
    });
  }

  async findAll() {
    const results = await this.prisma.result.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return results.map(result => ({
      ...result,
      boards: this.mapNumbersToBoards(result.numbers)
    }));
  }

  private mapNumbersToBoards(numbers: string) {
    if (numbers.length !== 5) {
      throw new BadRequestException('Numbers must be a 5-digit string');
    }

    //example: "17362" -> A=3, B=6, C=2, AB=36, AC=32, BC=62, ABC=362, ABCD=7362

    const [, a, b, c, d] = numbers.split('');

    return {
      A: b,
      B: c,
      C: d,
      AB: b + c,
      AC: b + d,
      BC: c + d,
      ABC: b + c + d,
      ABCD: a + b + c + d
    };
  }

  async remove(id: number) {
    return this.prisma.result.delete({
      where: { id }
    });
  }
}