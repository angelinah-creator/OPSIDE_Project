import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';

@Injectable()
export class VideosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  // Create
  async create(file: Express.Multer.File, createVideoDto: CreateVideoDto) {
    if (!file) {
      throw new NotFoundException('Fichier vidéo requis');
    }
    const uploadResult = await this.uploadService.uploadMedia(file, 'videos');
    
    return this.prisma.video.create({
      data: {
        title: createVideoDto.title,
        description: createVideoDto.description,
        url: uploadResult.url,
        public_id: uploadResult.public_id,
      },
    });
  }

  // Find all
  async findAll() {
    return this.prisma.video.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  // Find one
  async findOne(id: string) {
    const video = await this.prisma.video.findUnique({ where: { id } });
    if (!video) throw new NotFoundException('Vidéo introuvable');
    return video;
  }

  // Update
  async update(id: string, updateVideoDto: UpdateVideoDto) {
    await this.findOne(id); // Vérifier si elle existe
    return this.prisma.video.update({
      where: { id },
      data: updateVideoDto,
    });
  }

  // Remove
  async remove(id: string) {
    const video = await this.findOne(id);
    await this.uploadService.deleteVideo(video.public_id);
    return this.prisma.video.delete({ where: { id } });
  }
}
