import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
  }) {
    return this.prisma.notification.create({
      data: {
        ...data,
        read: false,
        email_sent: true, // Par défaut on considère que l'email sera envoyé
      },
    });
  }

  async findAll(user_id: string) {
    return this.prisma.notification.findMany({
      where: { user_id },
      orderBy: { created_at: 'desc' },
    });
  }

  async markAsRead(id: string, user_id: string) {
    return this.prisma.notification.updateMany({
      where: { id, user_id },
      data: { read: true },
    });
  }

  async markAllAsRead(user_id: string) {
    return this.prisma.notification.updateMany({
      where: { user_id, read: false },
      data: { read: true },
    });
  }

  async getUnreadCount(user_id: string) {
    return this.prisma.notification.count({
      where: { user_id, read: false },
    });
  }

  async remove(id: string, userId: string) {
    return this.prisma.notification.delete({
      where: { id, user_id: userId },
    });
  }
}
