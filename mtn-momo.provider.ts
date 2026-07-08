import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { InitiatePaymentResult, PaymentProvider } from './payment-provider.interface';

/**
 * Intégration MTN Mobile Money (MoMo API Collections).
 * Même logique que OrangeMoneyProvider : simulation en attendant les
 * identifiants du sandbox MTN MoMo (https://momodeveloper.mtn.com).
 */
@Injectable()
export class MtnMomoProvider implements PaymentProvider {
  private readonly logger = new Logger('MtnMomoProvider');

  constructor(private config: ConfigService) {}

  async initiatePayment(phoneNumber: string, amountXaf: number, reference: string): Promise<InitiatePaymentResult> {
    const subscriptionKey = this.config.get('payments.mtnMomo.subscriptionKey');
    if (!subscriptionKey) {
      this.logger.warn('MTN_MOMO_SUBSCRIPTION_KEY manquant : mode simulation activé.');
    }

    const providerReference = `MOMO-${uuid().slice(0, 8).toUpperCase()}`;
    this.logger.log(`[SIMULATION] Paiement MTN MoMo de ${amountXaf} XAF pour ${phoneNumber} (ref: ${reference})`);

    return {
      providerReference,
      instructions: `Vous allez recevoir une demande de confirmation MTN MoMo sur ${phoneNumber} pour ${amountXaf} XAF (référence ${providerReference}).`,
    };
  }

  verifyWebhookSignature(_payload: any, _headers: Record<string, string>): boolean {
    // TODO production : vérifier la signature fournie par MTN MoMo.
    return true;
  }
}
