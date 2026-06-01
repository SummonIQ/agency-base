"use client";

import { useEffect, useState } from "react";
import { usePusher } from "@/hooks/use-pusher";
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { EventType } from "@/types/events";
import { showBrowserNotification, canShowNotifications, getBrowserNotificationPreference } from "@/lib/notifications/browser";

interface NotificationData {
  title: string;
  description: string;
  type: "default" | "destructive" | "success" | "info" | "warning";
  actionUrl?: string;
  actionText?: string;
}

/**
 * Component that listens for real-time notifications via Pusher
 * This should be mounted once in the app layout
 */
export function NotificationListener({ userId }: { userId: string }) {
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  const { client } = usePusher();

  useEffect(() => {
    if (!client || !userId || isInitialized) return;

    try {
      // Subscribe to user-specific channel
      const channel = client.subscribe(`user-${userId}`);

      // Listen for notification events
      channel.bind(EventType.Notification, (data: NotificationData) => {
        // Show toast notification
        toast({
          title: data.title,
          description: data.description,
          variant: data.type === "destructive" ? "destructive" : "default",
          duration: 5000,
          action: data.actionUrl ? (
            <ToastAction 
              altText={data.actionText || "View"} 
              onClick={() => router.push(data.actionUrl!)}
            >
              {data.actionText || "View"}
            </ToastAction>
          ) : undefined,
        });

        // Show browser notification if enabled
        if (canShowNotifications() && getBrowserNotificationPreference()) {
          showBrowserNotification(data.title, {
            body: data.description,
            data: { url: data.actionUrl },
            requireInteraction: data.type === "destructive" || data.type === "warning"
          });
        }

        // Refresh notifications if the user is on the notifications page
        if (window.location.pathname === "/notifications") {
          router.refresh();
        }
      });

      setIsInitialized(true);

      // Cleanup subscription on unmount
      return () => {
        client.unsubscribe(`user-${userId}`);
      };
    } catch (error) {
      console.error("Error setting up notification listener:", error);
    }
  }, [client, userId, router, isInitialized]);

  // This component doesn't render anything
  return null;
}
