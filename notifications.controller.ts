import { Controller, Get, Patch, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @ApiOperation({ summary: "Liste les notifications de l'utilisateur connecté (100 plus récentes)." })
  @Get()
  findMine(@CurrentUser() user) {
    return this.notificationsService.findForUser(user.userId);
  }

  @ApiOperation({ summary: 'Marque une notification comme lue.' })
  @Patch(':id/read')
  markAsRead(@CurrentUser() user, @Param('id') id: string) {
    return this.notificationsService.markAsRead(user.userId, id);
  }

  @ApiOperation({ summary: 'Marque toutes les notifications comme lues.' })
  @Patch('read-all')
  markAllAsRead(@CurrentUser() user) {
    return this.notificationsService.markAllAsRead(user.userId);
  }
}
