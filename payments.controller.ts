import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { PaymentProviderName } from './providers/payment-provider.interface';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initie un paiement Orange Money / MTN MoMo (ex: boost d\'annonce).' })
  @Post('initiate')
  initiate(@CurrentUser() user, @Body() dto: InitiatePaymentDto) {
    return this.paymentsService.initiate(user.userId, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Historique des transactions de l'utilisateur connecté." })
  @Get('mine')
  findMine(@CurrentUser() user) {
    return this.paymentsService.findMine(user.userId);
  }

  @Public()
  @ApiOperation({ summary: 'Webhook serveur-à-serveur appelé par Orange Money / MTN MoMo (pas par l\'app mobile).' })
  @Post('webhook/:provider')
  webhook(@Param('provider') provider: PaymentProviderName, @Body() payload: any) {
    return this.paymentsService.handleWebhook(provider, payload);
  }
}
