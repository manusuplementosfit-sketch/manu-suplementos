import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { CommonModule } from './common/common.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    CommonModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    SettingsModule,
    DashboardModule,
  ],
})
export class AppModule {}
