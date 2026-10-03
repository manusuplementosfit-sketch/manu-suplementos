import {
  Body,
  Controller,
  Delete,
  Get,
  Module,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Prisma } from '@prisma/client';
import { IsBoolean, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { AdminGuard } from '../auth/admin.guard';
import { PrismaService } from '../common/prisma.service';
import { MAX_UPLOAD_BYTES, StorageService } from '../common/storage.service';

class ProductDto {
  @IsString()
  @MinLength(2, { message: 'Nome muito curto' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  categoryId?: string | null;

  @IsInt()
  @Min(1, { message: 'Preço de venda obrigatório' })
  priceCents: number;

  @IsInt()
  @Min(0)
  costCents: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  promoPriceCents?: number | null;

  @IsBoolean()
  isLaunch: boolean;

  @IsInt()
  @Min(0)
  stock: number;

  @IsBoolean()
  active: boolean;
}

/** Campos que o cliente pode ver (sem o preço de custo). */
const publicSelect = {
  id: true,
  name: true,
  description: true,
  imageUrl: true,
  priceCents: true,
  promoPriceCents: true,
  isLaunch: true,
  stock: true,
  category: { select: { id: true, name: true } },
} satisfies Prisma.ProductSelect;

@Controller()
export class ProductsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  @Get('products')
  list(@Query('section') section?: string, @Query('categoryId') categoryId?: string, @Query('q') q?: string) {
    const where: Prisma.ProductWhereInput = { active: true };
    if (section === 'lancamentos') where.isLaunch = true;
    if (section === 'promocoes') where.promoPriceCents = { not: null };
    if (categoryId) where.categoryId = categoryId;
    if (q) where.name = { contains: q, mode: 'insensitive' };
    return this.prisma.product.findMany({ where, select: publicSelect, orderBy: { createdAt: 'desc' } });
  }

  @Get('admin/products')
  @UseGuards(AdminGuard)
  adminList() {
    return this.prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } });
  }

  @Post('admin/products')
  @UseGuards(AdminGuard)
  create(@Body() dto: ProductDto) {
    return this.prisma.product.create({ data: normalize(dto) });
  }

  @Put('admin/products/:id')
  @UseGuards(AdminGuard)
  async update(@Param('id') id: string, @Body() dto: ProductDto) {
    await this.findOrFail(id);
    return this.prisma.product.update({ where: { id }, data: normalize(dto) });
  }

  @Post('admin/products/:id/image')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_BYTES } }))
  async uploadImage(@Param('id') id: string, @UploadedFile() file?: Express.Multer.File) {
    await this.findOrFail(id);
    const imageUrl = await this.storage.save(file, 'products');
    return this.prisma.product.update({ where: { id }, data: { imageUrl } });
  }

  /** Produtos que já foram vendidos são apenas desativados, para preservar o histórico. */
  @Delete('admin/products/:id')
  @UseGuards(AdminGuard)
  async remove(@Param('id') id: string) {
    await this.findOrFail(id);
    const sold = await this.prisma.orderItem.count({ where: { productId: id } });
    if (sold > 0) {
      await this.prisma.product.update({ where: { id }, data: { active: false } });
      return { archived: true };
    }
    await this.prisma.product.delete({ where: { id } });
    return { archived: false };
  }

  private async findOrFail(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Produto não encontrado');
    return product;
  }
}

function normalize(dto: ProductDto) {
  return {
    name: dto.name.trim(),
    description: dto.description?.trim() ?? '',
    categoryId: dto.categoryId || null,
    priceCents: dto.priceCents,
    costCents: dto.costCents,
    promoPriceCents: dto.promoPriceCents ?? null,
    isLaunch: dto.isLaunch,
    stock: dto.stock,
    active: dto.active,
  };
}

@Module({ controllers: [ProductsController] })
export class ProductsModule {}
