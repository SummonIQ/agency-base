'use client';

import type { User } from '@prisma/client';
import { PaintbrushIcon, UserCircleIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/css';

import { buttonVariants } from '../ui/button';

const SettingsMenu = ({
  user,
  className,
  ...props
}: { user?: User } & HTMLAttributes<HTMLDivElement>) => {
  const pathName = usePathname();

  const items = [
    {
      active: pathName === '/settings',
      href: '/settings',
      icon: UserCircleIcon,
      label: 'Account',
    },
    {
      active: pathName === '/settings/appearance',
      href: '/settings/appearance',
      icon: PaintbrushIcon,
      label: 'Appearance',
    },
  ];
  return (
    <nav
      className={cn(
        'flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1',
        className,
      )}
      {...props}
    >
      {items.map((item, i) => (
        <Link
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'justify-start rounded-md hover:bg-accent/50',
            item.active ? '!bg-accent' : 'text-foreground/70',
          )}
          href={item.href}
          key={item.href}
        >
          <item.icon className="size-5" />

          {item.label}
        </Link>
      ))}
    </nav>
  );
};

SettingsMenu.displayName = 'SettingsMenu';

export { SettingsMenu };
