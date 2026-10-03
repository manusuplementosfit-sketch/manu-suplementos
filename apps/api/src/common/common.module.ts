import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { StorageService } from './storage.service';

@Global()
@Module({
  providers: [PrismaService, StorageService],
  exports: [PrismaService, StorageService],
})
export class CommonModule {}
