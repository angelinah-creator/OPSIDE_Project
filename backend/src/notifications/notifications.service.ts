import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  // Create
  async create(data: {
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        ...data,
        read: false,
        email_sent: true,
      },
    });

    this.notificationsGateway.sendNotificationToUser(data.user_id, notification);

    return notification;
  }

  // Find all
  async findAll(user_id: string) {
    return this.prisma.notification.findMany({
      where: { user_id },
      orderBy: { created_at: 'desc' },
    });
  }

  // Mark as read
  async markAsRead(id: string, user_id: string) {
    const result = await this.prisma.notification.updateMany({
      where: { id, user_id },
      data: { read: true },
    });
    this.notificationsGateway.server?.to(`user_${user_id}`).emit('unreadCountUpdate');
    return result;
  }

  // Mark all as read
  async markAllAsRead(user_id: string) {
    const result = await this.prisma.notification.updateMany({
      where: { user_id, read: false },
      data: { read: true },
    });
    this.notificationsGateway.server?.to(`user_${user_id}`).emit('unreadCountUpdate');
    return result;
  }

  // Récupère unread count
  async getUnreadCount(user_id: string) {
    return this.prisma.notification.count({
      where: { user_id, read: false },
    });
  }

  // Remove
  async remove(id: string, userId: string) {
    return this.prisma.notification.delete({
      where: { id, user_id: userId },
    });
  }
}
