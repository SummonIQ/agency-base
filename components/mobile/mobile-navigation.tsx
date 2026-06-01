"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Briefcase, 
  FileText, 
  BarChart2, 
  MessageSquare,
  Users,
  Menu,
  X,
  Bell,
  Settings
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface MobileNavigationProps {
  userId: string;
}

export function MobileNavigation({ userId }: MobileNavigationProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Don't render on desktop
  if (!isMobile) {
    return null;
  }

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Job Leads",
      href: "/leads",
      icon: Briefcase,
    },
    {
      name: "Resumes",
      href: "/resumes",
      icon: FileText,
    },
    {
      name: "Interviews",
      href: "/interviews",
      icon: MessageSquare,
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: BarChart2,
    },
    {
      name: "Networking",
      href: "/networking",
      icon: Users,
    },
  ];

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t flex md:hidden">
        <div className="flex justify-around items-center w-full h-16">
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className="flex flex-col items-center justify-center w-full h-full"
              >
                <Icon 
                  className={cn(
                    "h-5 w-5", 
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground"
                  )} 
                />
                <span className={cn(
                  "text-xs mt-0.5",
                  isActive 
                    ? "text-primary font-medium" 
                    : "text-muted-foreground"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="flex flex-col items-center justify-center h-full rounded-none w-full"
              >
                <Menu className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs mt-0.5 text-muted-foreground">More</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] p-0">
              <div className="flex flex-col p-4">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-semibold text-lg">Menu</h2>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    
                    return (
                      <Link 
                        key={item.name} 
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 rounded-lg",
                          isActive 
                            ? "bg-primary/10 text-primary" 
                            : "bg-muted/50 text-foreground hover:bg-muted"
                        )}
                      >
                        <Icon className="h-6 w-6 mb-2" />
                        <span className="text-sm font-medium">{item.name}</span>
                      </Link>
                    );
                  })}

                  <Link 
                    href="/notifications"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-lg",
                      pathname === "/notifications" || pathname.startsWith("/notifications/")
                        ? "bg-primary/10 text-primary" 
                        : "bg-muted/50 text-foreground hover:bg-muted"
                    )}
                  >
                    <Bell className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">Notifications</span>
                  </Link>
                  
                  <Link 
                    href="/settings"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-lg",
                      pathname === "/settings" || pathname.startsWith("/settings/")
                        ? "bg-primary/10 text-primary" 
                        : "bg-muted/50 text-foreground hover:bg-muted"
                    )}
                  >
                    <Settings className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">Settings</span>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
      
      {/* Add padding to the bottom of the page to account for the fixed navigation */}
      {isMobile && (
        <div className="h-16" /> 
      )}
    </>
  );
}
