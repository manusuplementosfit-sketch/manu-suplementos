import { Body, Controller, Delete, Get, Module, Param, Post, UseGuards } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { AdminGuard } from '../auth/admin.guard';
import { PrismaService } from '../common/prisma.service';

class CategoryDto {
  @IsString()
  @MinLength(2, { message: 'Nome muito curto' })
  name: string;
}

@Controller()
export class CategoriesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('categories')
  list() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  @Post('admin/categories')
  @UseGuards(AdminGuard)
  create(@Body() dto: CategoryDto) {
    return this.prisma.category.create({ data: { name: dto.name.trim() } });
  }

  @Delete('admin/categories/:id')
  @UseGuards(AdminGuard)
  async remove(@Param('id') id: string) {
    await this.prisma.category.delete({ where: { id } });
    return { ok: true };
  }
}

@Module({ controllers: [CategoriesController] })
export class CategoriesModule {}
