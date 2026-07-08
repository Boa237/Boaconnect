import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Public()
  @ApiOperation({ summary: 'Liste les 5 catégories (maisons, boutiques, terrains, commerces, artisans).' })
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }
}
