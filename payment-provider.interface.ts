export type PaymentProviderName = 'orange_money' | 'mtn_momo';

export interface InitiatePaymentResult {
  providerReference: string;
  /** Instruction à afficher à l'utilisateur : code USSD à composer, ou lien de paiement. */
  instructions: string;
}

/**
 * Interface commune à tous les fournisseurs de paiement mobile money.
 * Ajouter un nouveau fournisseur = créer une classe qui l'implémente et
 * l'enregistrer dans PaymentsModule — aucune autre partie du code ne change.
 */
export interface PaymentProvider {
  initiatePayment(phoneNumber: string, amountXaf: number, reference: string): Promise<InitiatePaymentResult>;
  /** Vérifie la signature/authenticité d'un webhook entrant (à implémenter par fournisseur). */
  verifyWebhookSignature(payload: any, headers: Record<string, string>): boolean;
}

export const PAYMENT_PROVIDERS = 'PAYMENT_PROVIDERS';
