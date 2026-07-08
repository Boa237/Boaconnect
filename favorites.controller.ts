import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('favorites')
@ApiBearerAuth()
@Controller('favorites')
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @ApiOperation({ summary: "Liste les annonces favorites de l'utilisateur connecté." })
  @Get()
  findMine(@CurrentUser() user) {
    return this.favoritesService.findListingsForUser(user.userId);
  }

  @ApiOperation({ summary: 'Ajoute une annonce aux favoris.' })
  @Post(':listingId')
  add(@CurrentUser() user, @Param('listingId') listingId: string) {
    return this.favoritesService.add(user.userId, listingId);
  }

  @ApiOperation({ summary: 'Retire une annonce des favoris.' })
  @Delete(':listingId')
  remove(@CurrentUser() user, @Param('listingId') listingId: string) {
    return this.favoritesService.remove(user.userId, listingId);
  }
}
