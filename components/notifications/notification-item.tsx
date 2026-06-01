"use client";

import { useState } from "react";
import { format } from "date-fns";
import { 
  Bell, 
  CheckCircle, 
  Info, 
  AlertCircle, 
  Calendar, 
  Briefcase, 
  Users,
  Share,
  FileText,
  Settings,
  X
} from "lucide-react";
import { cn } from "@/lib/css";
import { Button } from "@/components/ui/button";
import { markNotificationAsRead } from "@/lib/notifications";
import { NotificationCategory } from "@/lib/notifications/types";

interface NotificationItemProps {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: Date;
  isRead: boolean;
  onMarkAsRead: (id: string) => void;
  actionUrl?: string;
  userId: string;
}

export function NotificationItem({
  id,
  title,
  content,
  category,
  createdAt,
  isRead,
  onMarkAsRead,
  actionUrl,
  userId
}: NotificationItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle marking as read
  const handleMarkAsRead = async () => {
    if (isRead) return;
    
    try {
      setIsLoading(true);
      await markNotificationAsRead(id, userId);
      onMarkAsRead(id);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get icon based on category
  const getIcon = () => {
    switch (category) {
      case NotificationCategory.APPLICATION_STATUS:
        return <Briefcase className="h-5 w-5 text-blue-500" />;
      case NotificationCategory.INTERVIEW_REQUEST:
        return <Calendar className="h-5 w-5 text-green-500" />;
      case NotificationCategory.NETWORKING_REMINDER:
        return <Users className="h-5 w-5 text-indigo-500" />;
      case NotificationCategory.SHARE:
        return <Share className="h-5 w-5 text-purple-500" />;
      case NotificationCategory.RESUME_FEEDBACK:
        return <FileText className="h-5 w-5 text-amber-500" />;
      case NotificationCategory.SYSTEM:
        return <Settings className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div
      className={cn(
        "flex gap-3 p-4 border-b transition-colors",
        isRead ? "bg-background opacity-70" : "bg-accent/10"
      )}
    >
      <div className="flex-shrink-0 pt-1">{getIcon()}</div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className={cn(
            "font-semibold text-sm", 
            isRead ? "text-muted-foreground" : "text-foreground"
          )}>
            {title}
          </h4>
          <span className="text-xs text-muted-foreground">
            {format(new Date(createdAt), "MMM d, h:mm a")}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground mt-1">
          {content}
        </p>
        
        <div className="flex justify-between items-center mt-2">
          {actionUrl && (
            <a 
              href={actionUrl}
              className="text-sm text-primary hover:underline"
              onClick={handleMarkAsRead}
            >
              View details
            </a>
          )}
          
          {!isRead && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6 px-2"
              onClick={handleMarkAsRead}
              disabled={isLoading}
            >
              {isLoading ? "Marking..." : "Mark as read"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
