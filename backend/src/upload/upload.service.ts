import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; public_id: string }> {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Format de fichier non supporté. Utilisez JPEG, PNG, GIF ou WEBP');
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('Le fichier ne doit pas dépasser 5MB');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `freelance-platform/${folder}`,
          resource_type: 'image',
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto' },
          ],
        },
        (error, result) => {
          if (error || !result) {
            reject(new BadRequestException('Erreur lors de l\'upload: ' + (error?.message || 'Unknown error')));
          } else {
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
            });
          }
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  async uploadMedia(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; public_id: string; media_type: string }> {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const videoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime'];
    const docTypes = ['application/pdf'];

    let resourceType: 'image' | 'video' | 'raw' = 'raw';
    let mediaType = 'document';

    if (imageTypes.includes(file.mimetype)) {
      resourceType = 'image';
      mediaType = 'image';
    } else if (videoTypes.includes(file.mimetype)) {
      resourceType = 'video';
      mediaType = 'video';
    } else if (docTypes.includes(file.mimetype)) {
      resourceType = 'raw';
      mediaType = 'document';
    } else {
      throw new BadRequestException('Format de fichier non supporté');
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('Le fichier ne doit pas dépasser 50MB');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `freelance-platform/${folder}`,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error || !result) {
            reject(new BadRequestException('Erreur lors de l\'upload: ' + (error?.message || 'Unknown error')));
          } else {
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
              media_type: mediaType,
            });
          }
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
