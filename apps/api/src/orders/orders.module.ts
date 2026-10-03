import {
  Body,
  Controller,
  Get,
  Module,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminGuard } from '../auth/admin.guard';
import { MAX_UPLOAD_BYTES } from '../common/storage.service';
import { SettingsModule } from '../settings/settings.module';
import { AdminOrdersQuery, CreateOrderDto } from './orders.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.orders.create(dto);
  }

  @Get(':code')
  track(@Param('code') code: string, @Query('token') token: string) {
    return this.orders.track(code, token);
  }

  @Post(':code/receipt')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_BYTES } }))
  receipt(
    @Param('code') code: string,
    @Query('token') token: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.orders.attachReceipt(code, token, file);
  }
}

@Controller('admin/orders')
@UseGuards(AdminGuard)
export class AdminOrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  list(@Query() query: AdminOrdersQuery) {
    return this.orders.adminList(query);
  }

  @Post(':id/finalize')
  finalize(@Param('id') id: string) {
    return this.orders.finalize(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.orders.cancel(id);
  }
}

@Module({
  imports: [SettingsModule],
  controllers: [OrdersController, AdminOrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
