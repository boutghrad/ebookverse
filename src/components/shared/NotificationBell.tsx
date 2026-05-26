'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Bell, Check, Trash2, Package, Star, Tag, Info, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=15');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'PUT' });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications', { method: 'PUT' });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const wasUnread = notifications.find((n) => n.id === id)?.read === false;
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        if (wasUnread) setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package className="size-4 text-blue-500" />;
      case 'success': return <Star className="size-4 text-green-500" />;
      case 'promo': return <Tag className="size-4 text-amber-500" />;
      case 'warning': return <AlertCircle className="size-4 text-orange-500" />;
      case 'system': return <Info className="size-4 text-purple-500" />;
      default: return <Bell className="size-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                <Bell className="size-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 size-5 p-0 flex items-center justify-center bg-gradient-to-r from-red-500 to-rose-600 text-white border-0 text-[10px] animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent align="end" className="w-80 sm:w-96 p-0" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] h-5">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 text-violet-600 hover:text-violet-700"
              onClick={markAllAsRead}
              disabled={loading}
            >
              <Check className="size-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="size-12 rounded-full bg-accent flex items-center justify-center mb-3">
                <Bell className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                We&apos;ll notify you about orders, promotions, and updates
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'relative px-4 py-3 transition-colors hover:bg-accent/50 cursor-pointer group',
                    !notification.read && 'bg-violet-50/50 dark:bg-violet-950/20'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {notification.link ? (
                    <Link href={notification.link} className="block">
                      <NotificationItem
                        notification={notification}
                        getIcon={getNotificationIcon}
                        formatTime={formatTimeAgo}
                        onDelete={deleteNotification}
                        onMarkRead={markAsRead}
                      />
                    </Link>
                  ) : (
                    <NotificationItem
                      notification={notification}
                      getIcon={getNotificationIcon}
                      formatTime={formatTimeAgo}
                      onDelete={deleteNotification}
                      onMarkRead={markAsRead}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t px-4 py-2">
            <Link
              href="/notifications"
              className="text-xs text-center block text-violet-600 hover:text-violet-700 font-medium"
              onClick={() => setOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function NotificationItem({
  notification,
  getIcon,
  formatTime,
  onDelete,
  onMarkRead,
}: {
  notification: Notification;
  getIcon: (type: string) => React.ReactNode;
  formatTime: (date: string) => string;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onMarkRead: (id: string) => void;
}) {
  return (
    <div className="flex gap-3 pr-6">
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        <div className="size-8 rounded-full bg-accent flex items-center justify-center">
          {getIcon(notification.type)}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            'text-sm leading-tight',
            !notification.read ? 'font-semibold' : 'font-medium text-muted-foreground'
          )}>
            {notification.title}
          </p>
          {!notification.read && (
            <div className="size-2 rounded-full bg-violet-500 flex-shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-muted-foreground">
            {formatTime(notification.createdAt)}
          </span>
          {notification.link && (
            <ExternalLink className="size-2.5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="absolute right-2 top-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notification.read && (
          <button
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); onMarkRead(notification.id); }}
            className="size-6 rounded flex items-center justify-center hover:bg-accent"
            title="Mark as read"
          >
            <Check className="size-3 text-muted-foreground" />
          </button>
        )}
        <button
          onClick={(e) => onDelete(notification.id, e)}
          className="size-6 rounded flex items-center justify-center hover:bg-destructive/10"
          title="Delete"
        >
          <Trash2 className="size-3 text-muted-foreground hover:text-destructive" />
        </button>
      </div>
    </div>
  );
}
