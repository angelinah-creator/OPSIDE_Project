import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SkillCategory } from '@prisma/client';

@Controller('skills')
@UseGuards(JwtAuthGuard)
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  findAll(@Query('category') category?: SkillCategory) {
    return this.skillsService.findAll(category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skillsService.findOne(id);
  }
}
