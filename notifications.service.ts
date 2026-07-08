import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

/**
 * Gère les notifications in-app (persistées en base, affichées dans l'écran
 * "Notifications" du mobile). Le point d'extension `pushToDevice()` est prêt
 * à être branché sur Firebase Cloud Messaging (FCM) pour le push natif Android :
 * il suffit d'y ajouter l'appel au SDK FCM avec le token de l'utilisateur.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger('NotificationsService');

  constructor(@InjectRepository(Notification) private repo: Repository<Notification>) {}

  findForUser(userId: string) {
    return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' }, take: 100 });
  }

  async markAsRead(userId: string, notificationId: string) {
    await this.repo.update({ id: notificationId, userId }, { isRead: true });
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await this.repo.update({ userId, isRead: false }, { isRead: true });
    return { success: true };
  }

  async create(userId: string, type: Notification['type'], title: string, body: string, listingId?: string) {
    const notif = this.repo.create({ userId, type, title, body, listingId });
    await this.repo.save(notif);
    await this.pushToDevice(userId, title, body);
    return notif;
  }

  async notifyListingDecision(ownerId: string, listingId: string, decision: 'approved' | 'rejected', reason?: string) {
    if (decision === 'approved') {
      return this.create(ownerId, 'listing_approved', 'Annonce approuvée', 'Votre annonce est maintenant en ligne.', listingId);
    }
    return this.create(
      ownerId,
      'listing_rejected',
      'Annonce rejetée',
      reason ? `Votre annonce a été rejetée : ${reason}` : 'Votre annonce a été rejetée.',
      listingId,
    );
  }

  /** Point d'extension FCM — no-op pour l'instant, log uniquement. */
  private async pushToDevice(userId: string, title: string, body: string) {
    // TODO production : récupérer le device token de l'utilisateur (table user_devices)
    // et appeler admin.messaging().send({ token, notification: { title, body } }) via firebase-admin.
    this.logger.log(`🔔 [push stub] user=${userId} title="${title}"`);
  }
}
