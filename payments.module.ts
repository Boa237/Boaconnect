import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PAYMENT_PROVIDERS } from './providers/payment-provider.interface';
import { OrangeMoneyProvider } from './providers/orange-money.provider';
import { MtnMomoProvider } from './providers/mtn-momo.provider';
import { ListingsModule } from '../listings/listings.module';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction]), ListingsModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    OrangeMoneyProvider,
    MtnMomoProvider,
    {
      provide: PAYMENT_PROVIDERS,
      useFactory: (orange: OrangeMoneyProvider, mtn: MtnMomoProvider) => ({
        orange_money: orange,
        mtn_momo: mtn,
      }),
      inject: [OrangeMoneyProvider, MtnMomoProvider],
    },
  ],
})
export class PaymentsModule {}
