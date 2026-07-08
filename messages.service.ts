import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { StartConversationDto } from './dto/start-conversation.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Conversation) private conversationsRepo: Repository<Conversation>,
    @InjectRepository(Message) private messagesRepo: Repository<Message>,
    private notificationsService: NotificationsService,
  ) {}

  /** Liste les conversations d'un utilisateur, triées par dernier message. */
  findConversations(userId: string) {
    return this.conversationsRepo
      .createQueryBuilder('c')
      .where('c.participant_one_id = :userId OR c.participant_two_id = :userId', { userId })
      .orderBy('c.lastMessageAt', 'DESC', 'NULLS LAST')
      .getMany();
  }

  async findMessages(conversationId: string, userId: string) {
    const conversation = await this.assertParticipant(conversationId, userId);
    return this.messagesRepo.find({ where: { conversationId: conversation.id }, order: { createdAt: 'ASC' } });
  }

  /** Démarre une conversation (ou réutilise celle qui existe déjà) puis envoie le premier message. */
  async start(userId: string, dto: StartConversationDto) {
    if (userId === dto.recipientId) {
      throw new ForbiddenException('Vous ne pouvez pas démarrer une conversation avec vous-même.');
    }

    let conversation = await this.conversationsRepo
      .createQueryBuilder('c')
      .where(
        '(c.participant_one_id = :a AND c.participant_two_id = :b) OR (c.participant_one_id = :b AND c.participant_two_id = :a)',
        { a: userId, b: dto.recipientId },
      )
      .getOne();

    if (!conversation) {
      conversation = await this.conversationsRepo.save(
        this.conversationsRepo.create({
          participantOneId: userId,
          participantTwoId: dto.recipientId,
          listingId: dto.listingId || null,
        }),
      );
    }

    const message = await this.postMessage(conversation.id, userId, dto.message);
    return { conversation, message };
  }

  async sendMessage(conversationId: string, userId: string, body: string) {
    await this.assertParticipant(conversationId, userId);
    return this.postMessage(conversationId, userId, body);
  }

  private async postMessage(conversationId: string, senderId: string, body: string) {
    const message = await this.messagesRepo.save(this.messagesRepo.create({ conversationId, senderId, body }));
    await this.conversationsRepo.update(conversationId, { lastMessageAt: new Date() });

    const conversation = await this.conversationsRepo.findOne({ where: { id: conversationId } });
    const recipientId =
      conversation.participantOneId === senderId ? conversation.participantTwoId : conversation.participantOneId;
    await this.notificationsService.create(
      recipientId,
      'system',
      'Nouveau message',
      body.length > 60 ? body.slice(0, 60) + '…' : body,
      conversation.listingId || undefined,
    );

    return message;
  }

  private async assertParticipant(conversationId: string, userId: string): Promise<Conversation> {
    const conversation = await this.conversationsRepo.findOne({ where: { id: conversationId } });
    if (!conversation) throw new NotFoundException('Conversation introuvable.');
    if (conversation.participantOneId !== userId && conversation.participantTwoId !== userId) {
      throw new ForbiddenException("Vous ne faites pas partie de cette conversation.");
    }
    return conversation;
  }
}
