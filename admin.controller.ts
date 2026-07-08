import { Body, Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/listings')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @ApiOperation({ summary: "Liste les annonces en attente (ou approuvées via ?status=approved). Admin uniquement." })
  @Get()
  find(@Query('status') status?: 'pending' | 'approved') {
    return status === 'approved' ? this.adminService.getApprovedListings() : this.adminService.getPendingListings();
  }

  @ApiOperation({ summary: 'Approuve une annonce.' })
  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.adminService.approve(id);
  }

  @ApiOperation({ summary: 'Rejette une annonce avec un motif.' })
  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body('reason') reason: string) {
    return this.adminService.reject(id, reason);
  }

  @ApiOperation({ summary: 'Supprime définitivement une annonce.' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminService.remove(id);
  }
}
