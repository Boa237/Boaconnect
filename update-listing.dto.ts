import { PartialType } from '@nestjs/mapped-types';
import { CreateListingDto } from './create-listing.dto';

// NOTE: nécessite `npm i @nestjs/mapped-types`
export class UpdateListingDto extends PartialType(CreateListingDto) {}
