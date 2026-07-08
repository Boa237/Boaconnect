import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdsService } from './ads.service';
import { CreateAdDto } from './dto/create-ad.dto';
import { AdPlacement } from './entities/ad.entity';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('ads')
@Controller('ads')
export class AdsController {
  constructor(private adsService: AdsService) {}

  @Public()
  @ApiOperation({ summary: "Publicités actives pour un emplacement donné (ex: home_banner)." })
  @Get()
  findActive(@Query('placement') placement: AdPlacement) {
    return this.adsService.findActive(placement);
  }

  @Public()
  @ApiOperation({ summary: "Enregistre un clic sur une publicité." })
  @Post(':id/click')
  registerClick(@Param('id') id: string) {
    return this.adsService.registerClick(id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Liste toutes les publicités (admin).' })
  @Get('admin/all')
  findAll() {
    return this.adsService.findAll();
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crée une publicité (admin).' })
  @Post('admin')
  create(@Body() dto: CreateAdDto) {
    return this.adsService.create(dto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Supprime une publicité (admin).' })
  @Delete('admin/:id')
  remove(@Param('id') id: string) {
    return this.adsService.remove(id);
  }
}
