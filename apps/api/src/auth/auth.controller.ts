import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { PrismaService } from '../common/prisma.service';
import { AdminGuard, AdminPayload } from './admin.guard';

const PASSWORD_RULE = { message: 'A nova senha precisa ter pelo menos 8 caracteres' };

class LoginDto {
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @IsString()
  password: string;
}

class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8, PASSWORD_RULE)
  newPassword: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private signToken(admin: { id: string; email: string }) {
    const payload: AdminPayload = { sub: admin.id, email: admin.email };
    return this.jwt.signAsync(payload);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const admin = await this.prisma.admin.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!admin || !(await compare(dto.password, admin.passwordHash))) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }
    return { token: await this.signToken(admin), name: admin.name };
  }

  @Get('me')
  @UseGuards(AdminGuard)
  async me(@Req() req: { admin: AdminPayload }) {
    const admin = await this.prisma.admin.findUniqueOrThrow({ where: { id: req.admin.sub } });
    return { name: admin.name, email: admin.email };
  }

  /** Troca de senha dentro do painel; devolve uma sessão nova, porque as antigas deixam de valer. */
  @Put('password')
  @UseGuards(AdminGuard)
  async changePassword(@Req() req: { admin: AdminPayload }, @Body() dto: ChangePasswordDto) {
    const admin = await this.prisma.admin.findUniqueOrThrow({ where: { id: req.admin.sub } });
    if (!(await compare(dto.currentPassword, admin.passwordHash))) {
      throw new BadRequestException('A senha atual está incorreta');
    }
    const updated = await this.prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash: await hash(dto.newPassword, 10), passwordChangedAt: new Date() },
    });
    return { token: await this.signToken(updated), message: 'Senha alterada' };
  }
}

