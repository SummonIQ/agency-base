"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NotificationItem } from "@/components/notifications/notification-item";
import { getUserNotifications } from "@/lib/notifications";
import { NotificationStatus, NotificationCategory } from "@/lib/notifications/types";
import type { Notification as NotificationModel } from "@prisma/client";
import { Loader2, Bell, Inbox, Filter, Search, XCircle, Check } from "lucide-react";
import { getCurrentUser } from "@/lib/user";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<string | null>(null);

  // Fetch user and initial notifications
  useEffect(() => {
    const fetchUserAndNotifications = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserId(user.id);
          await loadNotifications(user.id);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndNotifications();
  }, []);

  // Load notifications with current filters and pagination
  const loadNotifications = async (
    id: string, 
    pageToLoad = 0, 
    includeRead = true,
    query = searchQuery,
    categoryFilter = filter
  ) => {
    try {
      setLoading(true);
      const limit = 10;
      const offset = pageToLoad * limit;
      
      // Get notifications based on filters
      const result = await getUserNotifications(id, { 
        limit, 
        offset,
        includeRead: includeRead || tab === "all"
      });

      // Apply client-side filters if needed
      let filtered = result.notifications;
      
      if (query) {
        const lowerQuery = query.toLowerCase();
        filtered = filtered.filter(
          (n: NotificationModel) => n.title.toLowerCase().includes(lowerQuery) ||
               n.content.toLowerCase().includes(lowerQuery)
        );
      }
      
      if (categoryFilter) {
        filtered = filtered.filter((n: NotificationModel) => n.category === categoryFilter);
      }
      
      if (pageToLoad === 0) {
        setNotifications(filtered);
      } else {
        setNotifications(prev => [...prev, ...filtered]);
      }
      
      setHasMore(result.hasMore);
      setPage(pageToLoad);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setTab(value as "all" | "unread");
    if (userId) {
      loadNotifications(userId, 0, value === "all");
    }
  };

  // Handle search query change
  const handleSearch = () => {
    if (userId) {
      loadNotifications(userId, 0, tab === "all", searchQuery, filter);
    }
  };

  // Handle category filter change
  const handleFilterChange = (category: string | null) => {
    setFilter(category);
    if (userId) {
      loadNotifications(userId, 0, tab === "all", searchQuery, category);
    }
  };

  // Load more notifications
  const handleLoadMore = () => {
    if (userId && hasMore && !loading) {
      loadNotifications(userId, page + 1, tab === "all", searchQuery, filter);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map((n: NotificationModel) => 
      n.id === id ? { ...n, status: NotificationStatus.READ } : n
    ));
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    // In a real implementation, you would call an API endpoint to mark all as read
    setNotifications(notifications.map(n => ({ ...n, status: NotificationStatus.READ })));
  };

  // Render category badge
  const renderCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      [NotificationCategory.APPLICATION_STATUS]: "bg-blue-100 text-blue-800",
      [NotificationCategory.INTERVIEW_REQUEST]: "bg-green-100 text-green-800",
      [NotificationCategory.NETWORKING_REMINDER]: "bg-purple-100 text-purple-800",
      [NotificationCategory.AUTOMATION]: "bg-rose-100 text-rose-800",
      [NotificationCategory.JOB_SEARCH]: "bg-teal-100 text-teal-800",
      [NotificationCategory.RESUME_ANALYSIS]: "bg-amber-100 text-amber-800",
      [NotificationCategory.RESUME_FEEDBACK]: "bg-amber-100 text-amber-800",
      [NotificationCategory.SHARE]: "bg-indigo-100 text-indigo-800",
      [NotificationCategory.SYSTEM]: "bg-gray-100 text-gray-800",
    };
    
    const labels: Record<string, string> = {
      [NotificationCategory.APPLICATION_STATUS]: "Application",
      [NotificationCategory.INTERVIEW_REQUEST]: "Interview",
      [NotificationCategory.NETWORKING_REMINDER]: "Networking",
      [NotificationCategory.AUTOMATION]: "Automation",
      [NotificationCategory.JOB_SEARCH]: "Job Search",
      [NotificationCategory.RESUME_ANALYSIS]: "Resume",
      [NotificationCategory.RESUME_FEEDBACK]: "Resume",
      [NotificationCategory.SHARE]: "Sharing",
      [NotificationCategory.SYSTEM]: "System",
    };
    
    return (
      <span className={`text-xs px-2 py-1 rounded ${colors[category] || "bg-gray-100 text-gray-800"}`}>
        {labels[category] || category}
      </span>
    );
  };

  if (!userId && !loading) {
    return (
      <Card className="mt-6">
        <CardContent className="py-10 text-center">
          <p>You need to be signed in to view notifications.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notifications
            </CardTitle>
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8"
                onClick={handleMarkAllAsRead}
              >
                <Check className="mr-1 h-4 w-4" /> Mark all as read
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and filter */}
          <div className="mb-4 flex flex-col md:flex-row gap-2">
            <div className="flex gap-2 flex-1">
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2 items-center">
              <div className="text-sm mr-2">Filter:</div>
              <div className="flex flex-wrap gap-1">
                {Object.values(NotificationCategory).map((category) => (
                  <Button
                    key={category}
                    variant={filter === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange(filter === category ? null : category)}
                    className="h-8"
                  >
                    {renderCategoryBadge(category)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs for All/Unread */}
          <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              {renderNotificationList()}
            </TabsContent>
            
            <TabsContent value="unread" className="mt-0">
              {renderNotificationList()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );

  function renderNotificationList() {
    if (loading && notifications.length === 0) {
      return (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <div className="text-center py-10">
          <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No notifications</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            When you receive notifications, they will appear here.
          </p>
        </div>
      );
    }

    return (
      <div className="border rounded-md">
        <div className="divide-y">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              id={notification.id}
              title={notification.title}
              content={notification.content}
              category={notification.category}
              createdAt={new Date(notification.createdAt)}
              isRead={notification.status === NotificationStatus.READ}
              onMarkAsRead={handleMarkAsRead}
              userId={userId as string}
              actionUrl={
                (notification.metadata as any)?.jobLeadId
                  ? `/leads/${(notification.metadata as any).jobLeadId}`
                  : (notification.metadata as any)?.link ?? undefined
              }
            />
          ))}
        </div>

        {hasMore && (
          <div className="py-4 text-center">
            <Button 
              onClick={handleLoadMore} 
              disabled={loading}
              variant="outline"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Load more
            </Button>
          </div>
        )}
      </div>
    );
  }
}
