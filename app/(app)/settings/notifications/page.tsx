"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUserNotificationPreferences, updateNotificationPreferences } from "@/lib/notifications";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NotificationFrequency,
  type NotificationPreferences,
} from "@/lib/notifications/types";
import { Bell, Globe, AlertCircle, Loader2, Check, Lock, Settings } from "lucide-react";
import { getCurrentUser } from "@/lib/user";
import { requestNotificationPermission, saveBrowserNotificationPreference, getBrowserNotificationPreference } from "@/lib/notifications/browser";

type PreferencesState = Omit<NotificationPreferences, 'userId'>;

const INITIAL_PREFERENCES: PreferencesState = {
  ...DEFAULT_NOTIFICATION_PREFERENCES,
};

export default function NotificationSettingsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [preferences, setPreferences] = useState<PreferencesState>(INITIAL_PREFERENCES);

  // Fetch user and notification preferences
  useEffect(() => {
    async function fetchUserAndPreferences() {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserId(user.id);
          const userPreferences = await getUserNotificationPreferences(user.id);
          const { userId: _ignored, ...rest } = userPreferences;
          setPreferences(rest);
          setBrowserEnabled(rest.browserEnabled && getBrowserNotificationPreference());
          setHasChanges(false);
        }
      } catch (error) {
        console.error("Error fetching notification preferences:", error);
        setError("Failed to load notification preferences.");
      } finally {
        setLoading(false);
      }
    }

    fetchUserAndPreferences();
  }, []);

  const updatePreference = <K extends keyof PreferencesState>(key: K, value: PreferencesState[K]) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const togglePreference = <K extends keyof PreferencesState>(key: K) => {
    const current = preferences[key];
    if (typeof current === 'boolean') {
      updatePreference(key, (!current) as PreferencesState[K]);
    }
  };

  // Handle browser permission request
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>("default");
  const [browserEnabled, setBrowserEnabled] = useState(DEFAULT_NOTIFICATION_PREFERENCES.browserEnabled);
  
  // Check browser notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if browser supports notifications
      if ("Notification" in window) {
        setBrowserPermission(Notification.permission);
        setBrowserEnabled(getBrowserNotificationPreference());
      }
    }
  }, []);
  
  // Request browser notification permission
  const handleRequestPermission = async () => {
    try {
      const permission = await requestNotificationPermission();
      setBrowserPermission(permission);
      
      if (permission === "granted") {
        // Save preference if permission granted
        saveBrowserNotificationPreference(true);
        setBrowserEnabled(true);
        updatePreference('browserEnabled', true);
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      setError("Failed to request notification permission.");
    }
  };
  
  // Toggle browser notifications
  const handleToggleBrowserNotifications = (enabled: boolean) => {
    setBrowserEnabled(enabled);
    saveBrowserNotificationPreference(enabled);
    updatePreference('browserEnabled', enabled);
  };

  // Save preferences
  const handleSave = async () => {
    if (!userId) return;

    try {
      setSaving(true);
      setSuccess(false);
      setError(null);
      
      await updateNotificationPreferences(userId, preferences);
      
      // Also save browser notification preference
      saveBrowserNotificationPreference(preferences.browserEnabled);
      
      setSuccess(true);
      setHasChanges(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      setError("Failed to update notification preferences.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="container py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            You need to be signed in to access notification settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">
            Your notification preferences have been updated successfully.
          </AlertDescription>
        </Alert>
      )}

      {/* Notification Channels */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="mr-2 h-5 w-5" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="inAppEnabled" className="font-medium">In-App Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications within the application.</p>
            </div>
            <Switch
              id="inAppEnabled"
              checked={preferences.inAppEnabled}
              onCheckedChange={() => togglePreference('inAppEnabled')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="emailEnabled" className="font-medium">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via email.</p>
            </div>
            <Switch
              id="emailEnabled"
              checked={preferences.emailEnabled}
              onCheckedChange={() => togglePreference('emailEnabled')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="browserEnabled" className="font-medium">Browser Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive push notifications in your browser.</p>
              {browserPermission !== "granted" && (
                <p className="text-xs text-yellow-500 flex items-center mt-1">
                  <Lock className="h-3 w-3 mr-1" />
                  Permission required
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {browserPermission !== "granted" ? (
                <Button 
                  size="sm" 
                  onClick={handleRequestPermission}
                  variant="outline"
                >
                  Request Permission
                </Button>
              ) : (
                <Switch
                  id="browserEnabled"
                  checked={browserEnabled}
                  onCheckedChange={handleToggleBrowserNotifications}
                  disabled={browserPermission !== "granted"}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Categories */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Notification Types
          </CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="applicationStatusEnabled" className="font-medium">Application Status Updates</Label>
              <p className="text-sm text-muted-foreground">Notifications about changes to your job applications.</p>
            </div>
            <Switch
              id="applicationStatusEnabled"
              checked={preferences.applicationStatusEnabled}
              onCheckedChange={() => togglePreference('applicationStatusEnabled')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="interviewRequestsEnabled" className="font-medium">Interview Requests</Label>
              <p className="text-sm text-muted-foreground">Notifications about interview invitations and schedules.</p>
            </div>
            <Switch
              id="interviewRequestsEnabled"
              checked={preferences.interviewRequestsEnabled}
              onCheckedChange={() => togglePreference('interviewRequestsEnabled')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="networkingRemindersEnabled" className="font-medium">Networking Reminders</Label>
              <p className="text-sm text-muted-foreground">Reminders about networking contacts and follow-ups.</p>
            </div>
            <Switch
              id="networkingRemindersEnabled"
              checked={preferences.networkingRemindersEnabled}
              onCheckedChange={() => togglePreference('networkingRemindersEnabled')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="resumeFeedbackEnabled" className="font-medium">Resume Feedback</Label>
              <p className="text-sm text-muted-foreground">Notifications about feedback on your resumes.</p>
            </div>
            <Switch
              id="resumeFeedbackEnabled"
              checked={preferences.resumeFeedbackEnabled}
              onCheckedChange={() => togglePreference('resumeFeedbackEnabled')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="shareNotificationsEnabled" className="font-medium">Sharing Activity</Label>
              <p className="text-sm text-muted-foreground">Notifications about shared job leads and resumes.</p>
            </div>
            <Switch
              id="shareNotificationsEnabled"
              checked={preferences.shareNotificationsEnabled}
              onCheckedChange={() => togglePreference('shareNotificationsEnabled')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="jobSearchEnabled" className="font-medium">Job Search Updates</Label>
              <p className="text-sm text-muted-foreground">Notifications when automated searches finish or encounter issues.</p>
            </div>
            <Switch
              id="jobSearchEnabled"
              checked={preferences.jobSearchEnabled}
              onCheckedChange={() => togglePreference('jobSearchEnabled')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="automationEnabled" className="font-medium">Automation Events</Label>
              <p className="text-sm text-muted-foreground">Alerts for automation starts, pauses, and failures.</p>
            </div>
            <Switch
              id="automationEnabled"
              checked={preferences.automationEnabled}
              onCheckedChange={() => togglePreference('automationEnabled')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="resumeAnalysisEnabled" className="font-medium">Resume Analysis</Label>
              <p className="text-sm text-muted-foreground">Results for resume analysis and optimization runs.</p>
            </div>
            <Switch
              id="resumeAnalysisEnabled"
              checked={preferences.resumeAnalysisEnabled}
              onCheckedChange={() => togglePreference('resumeAnalysisEnabled')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col space-y-1">
              <Label htmlFor="systemNotificationsEnabled" className="font-medium">System Notifications</Label>
              <p className="text-sm text-muted-foreground">Important system updates and announcements.</p>
            </div>
            <Switch
              id="systemNotificationsEnabled"
              checked={preferences.systemNotificationsEnabled}
              onCheckedChange={() => togglePreference('systemNotificationsEnabled')}
            />
          </div>
      </CardContent>
    </Card>

      {/* Delivery Preferences */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Delivery Preferences
          </CardTitle>
          <CardDescription>
            Control how often we notify you and define quiet hours.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col space-y-2">
              <Label className="font-medium">Notification cadence</Label>
              <Select
                value={preferences.notificationFrequency}
                onValueChange={(value) => updatePreference('notificationFrequency', value as NotificationFrequency)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NotificationFrequency.IMMEDIATE}>Immediate</SelectItem>
                  <SelectItem value={NotificationFrequency.BATCHED}>Batch similar alerts</SelectItem>
                  <SelectItem value={NotificationFrequency.MINIMAL}>Only critical updates</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Batching delivers a summary after a short delay to avoid notification overload.
              </p>
            </div>

            <div className="flex flex-col space-y-2">
              <Label className="font-medium" htmlFor="batchWindowMinutes">Batch window (minutes)</Label>
              <Input
                id="batchWindowMinutes"
                type="number"
                min={5}
                max={60}
                value={preferences.batchWindowMinutes}
                onChange={(event) => updatePreference('batchWindowMinutes', Number.parseInt(event.target.value || '15', 10))}
              />
              <p className="text-xs text-muted-foreground">
                How long we wait before sending a batched summary. Minimum 5 minutes.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <Label className="font-medium">Quiet hours</Label>
                <p className="text-sm text-muted-foreground">
                  Pause non-urgent notifications during selected hours.
                </p>
              </div>
              <Switch
                id="quietHoursEnabled"
                checked={preferences.quietHoursEnabled}
                onCheckedChange={() => togglePreference('quietHoursEnabled')}
              />
            </div>

            {preferences.quietHoursEnabled && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="quietStart">Quiet hours start</Label>
                  <Input
                    id="quietStart"
                    type="time"
                    value={preferences.quietHoursStart ?? ''}
                    onChange={(event) => updatePreference('quietHoursStart', event.target.value || null)}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="quietEnd">Quiet hours end</Label>
                  <Input
                    id="quietEnd"
                    type="time"
                    value={preferences.quietHoursEnd ?? ''}
                    onChange={(event) => updatePreference('quietHoursEnd', event.target.value || null)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="dailyDigestEnabled" className="font-medium">Daily summary</Label>
                <p className="text-sm text-muted-foreground">Receive a daily recap email of new activity.</p>
              </div>
              <Switch
                id="dailyDigestEnabled"
                checked={preferences.dailyDigestEnabled}
                onCheckedChange={() => togglePreference('dailyDigestEnabled')}
              />
            </div>

            {preferences.dailyDigestEnabled && (
              <div className="flex flex-col space-y-2">
                <Label htmlFor="dailyDigestHour">Delivery time</Label>
                <Input
                  id="dailyDigestHour"
                  type="time"
                  value={preferences.dailyDigestHour !== null ? `${String(preferences.dailyDigestHour).padStart(2, '0')}:00` : ''}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (!value) {
                      updatePreference('dailyDigestHour', null);
                      return;
                    }
                    const hour = Number.parseInt(value.split(':')[0] ?? '0', 10);
                    updatePreference('dailyDigestHour', hour);
                  }}
                />
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="weeklyDigestEnabled" className="font-medium">Weekly summary</Label>
                <p className="text-sm text-muted-foreground">Receive a weekly digest on the day you choose.</p>
              </div>
              <Switch
                id="weeklyDigestEnabled"
                checked={preferences.weeklyDigestEnabled}
                onCheckedChange={() => togglePreference('weeklyDigestEnabled')}
              />
            </div>

            {preferences.weeklyDigestEnabled && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col space-y-2">
                  <Label>Day of week</Label>
                  <Select
                    value={preferences.weeklyDigestDay !== null ? String(preferences.weeklyDigestDay) : ''}
                    onValueChange={(value) => updatePreference('weeklyDigestDay', value ? Number.parseInt(value, 10) : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sunday</SelectItem>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="weeklyDigestHour">Delivery time</Label>
                  <Input
                    id="weeklyDigestHour"
                    type="time"
                    value={preferences.weeklyDigestHour !== null ? `${String(preferences.weeklyDigestHour).padStart(2, '0')}:00` : ''}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (!value) {
                        updatePreference('weeklyDigestHour', null);
                        return;
                      }
                      const hour = Number.parseInt(value.split(':')[0] ?? '0', 10);
                      updatePreference('weeklyDigestHour', hour);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving || !hasChanges}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {saving ? "Saving..." : hasChanges ? "Save Changes" : "Saved"}
        </Button>
      </div>
    </div>
  );
}
