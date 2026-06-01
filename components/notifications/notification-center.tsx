"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationItem } from "./notification-item";
import { getUserNotificationsAction, markNotificationAsReadAction, markAllNotificationsAsReadAction } from "@/lib/notifications/actions";
import Link from "next/link";
import { NotificationStatus } from "@/lib/notifications/types";
import type { Notification as NotificationModel } from "@prisma/client";

export function NotificationCenter({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Load notifications when dropdown is opened
  const loadNotifications = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const result = await getUserNotificationsAction(userId, { limit: 5 });
      setNotifications(result.notifications);
      
      // Count unread notifications
      const unread = result.notifications.filter(
        n => n.status !== NotificationStatus.READ
      ).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle dropdown toggle
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      loadNotifications();
    }
  };

  // Mark notification as read
  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map((n) => 
      n.id === id ? { ...n, status: NotificationStatus.READ } : n
    ));
    setUnreadCount(Math.max(0, unreadCount - 1));
  };

  // Load initial unread count
  useEffect(() => {
    if (userId) {
      const checkUnreadCount = async () => {
        try {
          const result = await getUserNotificationsAction(userId, { limit: 1 });
          setUnreadCount(result.totalCount);
        } catch (error) {
          console.error("Failed to check unread count:", error);
        }
      };
      
      checkUnreadCount();
    }
  }, [userId]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs bg-primary/10 text-primary py-0.5 px-2 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <DropdownMenuGroup>
              {notifications.map(notification => (
                <DropdownMenuItem key={notification.id} className="p-0 focus:bg-transparent">
                  <NotificationItem
                    id={notification.id}
                    title={notification.title}
                    content={notification.content}
                    category={notification.category}
                    createdAt={new Date(notification.createdAt)}
                    isRead={notification.status === NotificationStatus.READ}
                    onMarkAsRead={handleMarkAsRead}
                    userId={userId}
                    actionUrl={
                      (notification.metadata as any)?.jobLeadId
                        ? `/leads/${(notification.metadata as any).jobLeadId}`
                        : (notification.metadata as any)?.link ?? undefined
                    }
                  />
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          )}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer justify-center">
          <Link href="/notifications" className="text-center w-full text-sm">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
