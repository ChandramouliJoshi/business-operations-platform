
import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt/jwt.guard.js';
import { NotificationsService } from './notifications.service.js';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  // Get all notifications for the logged-in user.
  @Get()
  getNotifications(@Req() req: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.notificationsService.getNotifications(
      req.user.userId,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
  }

  // Get unread notifications.
  @Get('unread')
  getUnreadNotifications(@Req() req: any) {
    return this.notificationsService.getUnreadNotifications(
      req.user.userId,
    );
  }

  // Mark one notification as read.
  @Patch(':notificationId/read')
  markAsRead(
    @Req() req: any,
    @Param('notificationId') notificationId: string,
  ) {
    return this.notificationsService.markAsRead(
      req.user.userId,
      notificationId,
    );
  }

  // Mark all notifications as read.
  @Patch('read-all')
  markAllAsRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(
      req.user.userId,
    );
  }

  // Delete a notification.
  @Delete(':notificationId')
  deleteNotification(
    @Req() req: any,
    @Param('notificationId') notificationId: string,
  ) {
    return this.notificationsService.deleteNotification(
      req.user.userId,
      notificationId,
    );
  }
}
