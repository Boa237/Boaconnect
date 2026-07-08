import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { StartConversationDto } from './dto/start-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('messages')
@ApiBearerAuth()
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @ApiOperation({ summary: "Liste les conversations de l'utilisateur connecté." })
  @Get('conversations')
  findConversations(@CurrentUser() user) {
    return this.messagesService.findConversations(user.userId);
  }

  @ApiOperation({ summary: "Liste les messages d'une conversation (participant uniquement)." })
  @Get('conversations/:id')
  findMessages(@CurrentUser() user, @Param('id') id: string) {
    return this.messagesService.findMessages(id, user.userId);
  }

  @ApiOperation({ summary: 'Envoie un message dans une conversation existante.' })
  @Post('conversations/:id')
  sendMessage(@CurrentUser() user, @Param('id') id: string, @Body() dto: SendMessageDto) {
    return this.messagesService.sendMessage(id, user.userId, dto.body);
  }

  @ApiOperation({ summary: 'Démarre une conversation avec un autre utilisateur (typiquement depuis une annonce).' })
  @Post('start')
  start(@CurrentUser() user, @Body() dto: StartConversationDto) {
    return this.messagesService.start(user.userId, dto);
  }
}
