'use client';

import { useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/css';

const languages = [
  { locale: 'en', label: 'English' },
  { locale: 'es', label: 'Español' },
];

export function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  // Extract the current locale from pathname
  // Example: /en/dashboard -> en
  const getCurrentLocale = () => {
    const segments = pathname.split('/').filter(Boolean);
    return segments.length > 0 && ['en', 'es'].includes(segments[0]) ? segments[0] : 'en';
  };

  const currentLocale = getCurrentLocale();
  
  // Handle locale change
  const handleLocaleChange = (locale: string) => {
    if (currentLocale === locale) {
      return;
    }

    // Close dropdown
    setOpen(false);
    
    // Get path without locale prefix
    let newPathname = pathname;
    if (['en', 'es'].includes(pathname.split('/')[1])) {
      // Remove current locale prefix
      newPathname = '/' + pathname.split('/').slice(2).join('/');
    }
    
    // Add new locale prefix
    newPathname = `/${locale}${newPathname}`;
    
    // Navigate to new path with updated locale
    startTransition(() => {
      router.push(newPathname);
    });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost" 
          size="sm"
          className="flex items-center gap-1 h-8 px-2" 
          aria-label="Change language"
          disabled={isPending}
        >
          <Globe className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">
            {languages.find(lang => lang.locale === currentLocale)?.label || 'English'}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map(language => (
          <DropdownMenuItem
            key={language.locale}
            onClick={() => handleLocaleChange(language.locale)}
            className={cn(
              "flex cursor-pointer items-center justify-between",
              currentLocale === language.locale && "font-semibold"
            )}
          >
            {language.label}
            {currentLocale === language.locale && (
              <Check className="h-4 w-4" aria-hidden="true" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
