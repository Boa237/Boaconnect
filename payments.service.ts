import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Transaction } from './entities/transaction.entity';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PAYMENT_PROVIDERS, PaymentProvider, PaymentProviderName } from './providers/payment-provider.interface';
import { ListingsService } from '../listings/listings.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Transaction) private transactionsRepo: Repository<Transaction>,
    @Inject(PAYMENT_PROVIDERS) private providers: Record<PaymentProviderName, PaymentProvider>,
    private listingsService: ListingsService,
  ) {}

  async initiate(userId: string, dto: InitiatePaymentDto) {
    const provider = this.providers[dto.provider];
    if (!provider) throw new BadRequestException('Fournisseur de paiement inconnu.');

    const reference = uuid();
    const result = await provider.initiatePayment(dto.phoneNumber, dto.amount, reference);

    const transaction = this.transactionsRepo.create({
      userId,
      listingId: dto.listingId || null,
      type: dto.type,
      amount: dto.amount,
      provider: dto.provider,
      providerReference: result.providerReference,
      status: 'pending',
    });
    await this.transactionsRepo.save(transaction);

    return { transaction, instructions: result.instructions };
  }

  findMine(userId: string) {
    return this.transactionsRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  /**
   * Webhook appelé par le fournisseur (Orange Money / MTN MoMo) pour confirmer
   * ou refuser un paiement. Marque la transaction comme réussie et applique
   * l'effet correspondant (ex: booste l'annonce pendant 7 jours).
   */
  async handleWebhook(providerName: PaymentProviderName, payload: any) {
    const provider = this.providers[providerName];
    if (!provider) throw new BadRequestException('Fournisseur inconnu.');

    // NOTE production : valider la signature avant de faire confiance au payload.
    // if (!provider.verifyWebhookSignature(payload, headers)) throw new UnauthorizedException();

    const transaction = await this.transactionsRepo.findOne({
      where: { providerReference: payload.providerReference },
    });
    if (!transaction) throw new NotFoundException('Transaction introuvable pour cette référence.');

    transaction.status = payload.status === 'SUCCESSFUL' ? 'success' : 'failed';
    await this.transactionsRepo.save(transaction);

    if (transaction.status === 'success' && transaction.type === 'listing_boost' && transaction.listingId) {
      await this.listingsService.boost(transaction.listingId, 7); // boost 7 jours
    }

    return { received: true };
  }
}
