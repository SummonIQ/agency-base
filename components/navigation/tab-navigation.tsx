'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/css';

export function TabNavigation({
  tabs,
  defaultValue,
}: {
  defaultValue?: string;
  tabs: Array<{
    content: React.ReactNode;
    href: string;
    label: string;
  }>;
}) {
  const pathname = usePathname();

  console.log('pathname', pathname);

  return (
    <Tabs value={pathname ?? defaultValue ?? tabs[0].href}>
      <TabsList>
        {tabs.map(tab => (
          <TabsTrigger asChild key={tab.href} value={tab.href}>
            <Link
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150',
              )}
              href={tab.href}
              // prefetch={true}
            >
              {tab.label}
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map(tab => (
        <TabsContent key={tab.href} value={tab.href}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
