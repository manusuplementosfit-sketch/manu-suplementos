import { DeliveryType, OrderStatus, PaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class OrderItemDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsString()
  @MinLength(3, { message: 'Informe seu nome' })
  customerName: string;

  @Matches(/^[\d\s()+-]{10,20}$/, { message: 'Telefone inválido' })
  customerPhone: string;

  @IsEnum(DeliveryType)
  deliveryType: DeliveryType;

  @ValidateIf((o: CreateOrderDto) => o.deliveryType === DeliveryType.ENTREGA)
  @IsString()
  @MinLength(8, { message: 'Informe o endereço de entrega' })
  address?: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @ArrayMinSize(1, { message: 'O carrinho está vazio' })
  items: OrderItemDto[];
}

export class AdminOrdersQuery {
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
