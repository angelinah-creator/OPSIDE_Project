import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('skills')
@UseGuards(JwtAuthGuard)
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  // Find all
  @Get()
  findAll(@CurrentUser() user: any, @Query('category') category?: string) {
    return this.skillsService.findAll(user.id, category);
  }

  // Create
  @Post()
  create(@CurrentUser() user: any, @Body() data: { name: string; category: string }) {
    return this.skillsService.create(user.id, data);
  }

  // Update
  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() data: { name?: string; category?: string },
  ) {
    return this.skillsService.update(user.id, id, data);
  }

  // Remove
  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.skillsService.remove(user.id, id);
  }

  // Find one
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skillsService.findOne(id);
  }
}
