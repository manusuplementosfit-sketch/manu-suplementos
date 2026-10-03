import { Body, Controller, Get, Injectable, Module, Put, UseGuards } from '@nestjs/common';
import { IsInt, IsString, MaxLength, Min } from 'class-validator';
import { AdminGuard } from '../auth/admin.guard';
import { PrismaService } from '../common/prisma.service';

class SettingsDto {
  @IsString()
  pixKey: string;

  @IsString()
  @MaxLength(25, { message: 'Nome do recebedor: no máximo 25 caracteres' })
  pixMerchantName: string;

  @IsString()
  @MaxLength(15, { message: 'Cidade: no máximo 15 caracteres' })
  pixCity: string;

  @IsInt()
  @Min(0)
  deliveryFeeCents: number;
}

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Existe sempre uma única linha de configurações (id = 1). */
  get() {
    return this.prisma.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
  }

  update(dto: SettingsDto) {
    const data = { ...dto, pixKey: dto.pixKey.trim() };
    return this.prisma.settings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  }
}

@Controller()
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get('settings/public')
  async publicSettings() {
    const s = await this.settings.get();
    return { deliveryFeeCents: s.deliveryFeeCents, pixEnabled: s.pixKey !== '' };
  }

  @Get('admin/settings')
  @UseGuards(AdminGuard)
  get() {
    return this.settings.get();
  }

  @Put('admin/settings')
  @UseGuards(AdminGuard)
  update(@Body() dto: SettingsDto) {
    return this.settings.update(dto);
  }
}

@Module({
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
