import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from '../common/prisma.service';
import { sessionStartedBeforePasswordChange } from './session';

export interface AdminPayload {
  sub: string;
  email: string;
  /** Momento em que a sessão foi criada (segundos), preenchido pelo JWT */
  iat?: number;
}

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { admin?: AdminPayload }>();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer' || !token) throw new UnauthorizedException();

    let payload: AdminPayload;
    try {
      payload = await this.jwt.verifyAsync<AdminPayload>(token);
    } catch {
      throw new UnauthorizedException();
    }

    // Conta removida ou senha trocada depois que a sessão começou: precisa entrar de novo
    const admin = await this.prisma.admin.findUnique({ where: { id: payload.sub }, select: { passwordChangedAt: true } });
    if (!admin || sessionStartedBeforePasswordChange(payload.iat, admin.passwordChangedAt)) {
      throw new UnauthorizedException('Sua sessão expirou. Entre de novo.');
    }
    request.admin = payload;
    return true;
  }
}
