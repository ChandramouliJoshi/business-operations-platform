
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateNotificationDto } from './dto/create-notification.dto.js';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a notification for a user.
  async createNotification(dto: CreateNotificationDto) {
    return this.prisma.notifications.create({
      data: {
        user_id: dto.user_id,
        type: dto.type,
        title: dto.title,
        message: dto.message,
      },
    });
  }

  // Get all notifications belonging to the logged-in user.
  async getNotifications(userId: string) {
    return this.prisma.notifications.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  // Get unread notifications belonging to the logged-in user.
  async getUnreadNotifications(userId: string) {
    return this.prisma.notifications.findMany({
      where: {
        user_id: userId,
        is_read: false,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  // Mark a specific notification as read.
  async markAsRead(
    userId: string,
    notificationId: string,
  ) {
    const notification =
      await this.prisma.notifications.findUnique({
        where: {
          id: notificationId,
        },
      });

    if (!notification) {
      throw new NotFoundException(
        'Notification not found',
      );
    }

    if (notification.user_id !== userId) {
      throw new ForbiddenException(
        'You cannot access this notification',
      );
    }

    return this.prisma.notifications.update({
      where: {
        id: notificationId,
      },
      data: {
        is_read: true,
      },
    });
  }

  // Mark all notifications belonging to the user as read.
  async markAllAsRead(userId: string) {
    const result = await this.prisma.notifications.updateMany({
      where: {
        user_id: userId,
        is_read: false,
      },
      data: {
        is_read: true,
      },
    });

    return {
      message: 'All notifications marked as read',
      count: result.count,
    };
  }

  // Delete a notification belonging to the user.
  async deleteNotification(
    userId: string,
    notificationId: string,
  ) {
    const notification =
      await this.prisma.notifications.findUnique({
        where: {
          id: notificationId,
        },
      });

    if (!notification) {
      throw new NotFoundException(
        'Notification not found',
      );
    }

    if (notification.user_id !== userId) {
      throw new ForbiddenException(
        'You cannot delete this notification',
      );
    }

    await this.prisma.notifications.delete({
      where: {
        id: notificationId,
      },
    });

    return {
      message: 'Notification deleted successfully',
    };
  }
}
