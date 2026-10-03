import {
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Module,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsInt, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';
import { AdminGuard } from '../auth/admin.guard';
import { PrismaService } from '../common/prisma.service';
import { MAX_UPLOAD_BYTES, StorageService } from '../common/storage.service';

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export class SettingsDto {
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

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'A meta do mês deve ser maior que zero' })
  monthlyGoalCents?: number | null;

  // Opcionais: a versão do site que ainda não tem a tela de Aparência não envia cores
  @IsOptional()
  @Matches(HEX_COLOR, { message: 'Cor principal inválida: use o formato #rrggbb' })
  brandColor?: string;

  @IsOptional()
  @Matches(HEX_COLOR, { message: 'Cor secundária inválida: use o formato #rrggbb' })
  inkColor?: string;
}

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Existe sempre uma única linha de configurações (id = 1). */
  get() {
    return this.prisma.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
  }

  update(dto: SettingsDto) {
    const data = {
      ...dto,
      pixKey: dto.pixKey.trim(),
      brandColor: dto.brandColor?.toLowerCase(),
      inkColor: dto.inkColor?.toLowerCase(),
    };
    return this.prisma.settings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  }

  setLogo(logoUrl: string | null) {
    return this.prisma.settings.upsert({ where: { id: 1 }, update: { logoUrl }, create: { id: 1, logoUrl } });
  }
}

@Controller()
export class SettingsController {
  constructor(
    private readonly settings: SettingsService,
    private readonly storage: StorageService,
  ) {}

  @Get('settings/public')
  async publicSettings() {
    const s = await this.settings.get();
    return {
      deliveryFeeCents: s.deliveryFeeCents,
      pixEnabled: s.pixKey !== '',
      brandColor: s.brandColor,
      inkColor: s.inkColor,
      logoUrl: s.logoUrl,
    };
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

  @Post('admin/settings/logo')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_BYTES } }))
  async uploadLogo(@UploadedFile() file?: Express.Multer.File) {
    const logoUrl = await this.storage.save(file, 'branding');
    return this.settings.setLogo(logoUrl);
  }

  @Delete('admin/settings/logo')
  @UseGuards(AdminGuard)
  removeLogo() {
    return this.settings.setLogo(null);
  }
}

@Module({
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
