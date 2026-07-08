import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { InitiatePaymentResult, PaymentProvider } from './payment-provider.interface';

/**
 * Intégration Orange Money Cameroun (Web Payment API).
 * En attendant les identifiants marchands réels, ce provider simule une
 * initiation de paiement réussie et journalise l'appel qui serait fait.
 *
 * Pour brancher le vrai service :
 * 1. Créer un compte marchand Orange Money Developer (https://developer.orange.com).
 * 2. Récupérer client_id / client_secret et les mettre dans .env (ORANGE_MONEY_*).
 * 3. Remplacer le corps de initiatePayment() par l'appel POST /webpayment réel.
 */
@Injectable()
export class OrangeMoneyProvider implements PaymentProvider {
  private readonly logger = new Logger('OrangeMoneyProvider');

  constructor(private config: ConfigService) {}

  async initiatePayment(phoneNumber: string, amountXaf: number, reference: string): Promise<InitiatePaymentResult> {
    const merchantKey = this.config.get('payments.orangeMoney.merchantKey');
    if (!merchantKey) {
      this.logger.warn('ORANGE_MONEY_MERCHANT_KEY manquant : mode simulation activé.');
    }

    // --- Simulation en attendant les vraies clés marchand ---
    const providerReference = `OM-${uuid().slice(0, 8).toUpperCase()}`;
    this.logger.log(`[SIMULATION] Paiement Orange Money de ${amountXaf} XAF pour ${phoneNumber} (ref: ${reference})`);

    return {
      providerReference,
      instructions: `Composez #150# sur votre téléphone Orange et confirmez le paiement de ${amountXaf} XAF (référence ${providerReference}).`,
    };
  }

  verifyWebhookSignature(_payload: any, _headers: Record<string, string>): boolean {
    // TODO production : vérifier la signature HMAC fournie par Orange Money dans les headers.
    return true;
  }
}
