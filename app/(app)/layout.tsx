import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import { OnboardingProvider } from '@/components/onboarding/onboarding-context';
import { InteractiveOnboardingModal } from '@/components/onboarding/interactive-onboarding-modal';
import { NotificationListener } from '@/components/notifications/notification-listener';
import TopNavigation from '@/components/navigation/top-navigation';
import { PusherProvider } from '@/components/providers/pusher-provider';
import { Toaster } from '@/components/ui/toaster';
import { getCurrentUser } from '@/lib/user';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  description: 'Complete agency management platform for growing your business',
  title: 'AgencyBase',
};

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 5, // Allow zooming up to 5x for accessibility
  viewportFit: 'cover',
  width: 'device-width',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const pusherConfig = {
    // optional if you'd like to trigger events. BYO endpoint.
    // see "Trigger Server" below for more info
    // triggerEndpoint: "/pusher/trigger",
    // required for private/presence channels
    // also sends auth headers to trigger endpoint
    authEndpoint: '/api/events/user-auth',
    channelAuthorization: {
      endpoint: '/api/events/channel-auth',
      transport: 'ajax' as const,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
    clientKey: process.env.NEXT_PUBLIC_PUSHER_KEY as string,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
  };

  return (
    <PusherProvider {...pusherConfig}>
      <OnboardingProvider>
        <div className="min-h-screen flex flex-col">
          {/* Top Navigation Bar */}
          <TopNavigation userId={user.id} />
          
          {/* Main Content Area */}
          <main className="flex-1 flex flex-col">
            {/* Interactive Onboarding Modal - will only show when isOnboarding is true */}
            <InteractiveOnboardingModal />
            {/* Real-time notification listener */}
            <NotificationListener userId={user.id} />
            {/* Breadcrumb + Theme Toggle Bar */}
            {/* <div className="border-b border-border/50 bg-background/40 px-4 h-12 flex items-center justify-between">
              <div className="flex items-center justify-between responsive center">
                <DynamicBreadcrumb />
                <ThemeModeToggle />
              </div>
            </div>
            */}
            {/* Page Content */}
            <div className="flex-1 overflow-auto pb-6">
              <div className="responsive center">
                {children}
              </div>
            </div>
          </main>
        </div>
        <Toaster />
      </OnboardingProvider>
    </PusherProvider>
  );
}