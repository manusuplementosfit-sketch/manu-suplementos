import { Body, Controller, Get, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { IsEmail, IsString } from 'class-validator';
import { PrismaService } from '../common/prisma.service';
import { AdminGuard, AdminPayload } from './admin.guard';

class LoginDto {
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @IsString()
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const admin = await this.prisma.admin.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (!admin || !(await compare(dto.password, admin.passwordHash))) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }
    const payload: AdminPayload = { sub: admin.id, email: admin.email };
    return { token: await this.jwt.signAsync(payload), name: admin.name };
  }

  @Get('me')
  @UseGuards(AdminGuard)
  async me(@Req() req: { admin: AdminPayload }) {
    const admin = await this.prisma.admin.findUniqueOrThrow({ where: { id: req.admin.sub } });
    return { name: admin.name, email: admin.email };
  }
}
