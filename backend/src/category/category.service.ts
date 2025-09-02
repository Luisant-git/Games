import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async findAll() {
    const [categories, games] = await Promise.all([
      this.prisma.category.findMany({
        include: {
          timing: {
            include: {
              showTimes: true,
            },
          },
        },
      }),
      this.prisma.game.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' } })
    ]);
    
    return { categories, games };
  }

  async findOne(id: number) {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        timing: {
          include: {
            showTimes: true,
          },
        },
      },
    });
  }

  async update(id: number, updateCategoryDto: CreateCategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: number) {
    return this.prisma.category.delete({
      where: { id },
    });
  }
}