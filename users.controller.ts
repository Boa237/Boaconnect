import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Récupère le profil de l\'utilisateur connecté.' })
  @Get('me')
  getMe(@CurrentUser() user) {
    return this.usersService.findById(user.userId);
  }

  @ApiOperation({ summary: 'Met à jour le profil de l\'utilisateur connecté.' })
  @Patch('me')
  updateMe(@CurrentUser() user, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.userId, dto);
  }
}
