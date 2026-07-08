import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { QueryListingsDto } from './dto/query-listings.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('listings')
@Controller('listings')
export class ListingsController {
  constructor(private listingsService: ListingsService) {}

  @Public()
  @ApiOperation({ summary: 'Liste les annonces approuvées, avec filtres (catégorie, ville, prix, recherche) et pagination.' })
  @Get()
  findAll(@Query() query: QueryListingsDto) {
    return this.listingsService.findApproved(query);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Liste les annonces de l'utilisateur connecté, tous statuts confondus." })
  @Get('mine')
  findMine(@CurrentUser() user) {
    return this.listingsService.findMine(user.userId);
  }

  @Public()
  @ApiOperation({ summary: "Détail d'une annonce (incrémente le compteur de vues public)." })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listingsService.findOneAndIncrementViews(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Journalise une consultation authentifiée (utilisé par le moteur de recommandations).' })
  @Post(':id/track-view')
  trackView(@CurrentUser() user, @Param('id') id: string) {
    return this.listingsService.trackAuthenticatedView(id, user.userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crée une nouvelle annonce (statut initial : en attente de modération).' })
  @Post()
  create(@CurrentUser() user, @Body() dto: CreateListingDto) {
    return this.listingsService.create(user.userId, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: "Associe des photos (déjà uploadées via /uploads/photos) à l'annonce." })
  @Post(':id/photos')
  attachPhotos(@CurrentUser() user, @Param('id') id: string, @Body('urls') urls: string[]) {
    return this.listingsService.attachPhotos(id, user.userId, urls);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifie une annonce (repasse en attente de modération). Propriétaire uniquement.' })
  @Patch(':id')
  update(@CurrentUser() user, @Param('id') id: string, @Body() dto: UpdateListingDto) {
    return this.listingsService.update(id, user.userId, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprime une annonce. Propriétaire uniquement.' })
  @Delete(':id')
  remove(@CurrentUser() user, @Param('id') id: string) {
    return this.listingsService.remove(id, user.userId);
  }
}
