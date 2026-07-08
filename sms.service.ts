import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Service d'envoi de SMS, avec un fournisseur "console" par défaut (pratique en
 * développement : le code OTP est simplement affiché dans les logs du serveur).
 *
 * Pour brancher un vrai fournisseur (Twilio, Nexmo, ou un agrégateur local
 * camerounais), implémentez sendSms() ici en lisant la config sms.provider.
 * Le reste de l'application n'a pas besoin de changer.
 */
@Injectable()
export class SmsService {
  private readonly logger = new Logger('SmsService');

  constructor(private config: ConfigService) {}

  async sendOtp(phoneNumber: string, code: string): Promise<void> {
    const provider = this.config.get('sms.provider');

    if (provider === 'twilio') {
      await this.sendViaTwilio(phoneNumber, code);
      return;
    }

    // Fournisseur "console" (par défaut en dev)
    this.logger.log(`📱 [DEV] Code OTP pour ${phoneNumber} : ${code}`);
  }

  private async sendViaTwilio(phoneNumber: string, code: string): Promise<void> {
    // Exemple d'intégration (nécessite `npm i twilio` et les identifiants Twilio) :
    //
    // const twilio = require('twilio')(
    //   this.config.get('sms.twilio.accountSid'),
    //   this.config.get('sms.twilio.authToken'),
    // );
    // await twilio.messages.create({
    //   body: `Votre code Mboa Connect : ${code}`,
    //   from: this.config.get('sms.twilio.fromNumber'),
    //   to: phoneNumber,
    // });
    this.logger.warn('Twilio non configuré : implémentez sendViaTwilio() avant la mise en production.');
  }
}
