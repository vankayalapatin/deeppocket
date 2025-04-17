// components/dashboard/sidebar.tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { 
  BarChart3, 
  CreditCard, 
  Home, 
  Layers, 
  LayoutDashboard, 
  LifeBuoy, 
  Package2, 
  Receipt,
  Settings, 
  UserCircle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useUserData } from "@/lib/hooks/useUserData"

interface NavProps {
  isCollapsed: boolean
  links: {
    title: string
    label?: string
    icon: React.ReactNode
    variant: "default" | "ghost"
    href: string
  }[]
}

export function Nav({ links, isCollapsed }: NavProps) {
  const pathname = usePathname()

  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) => {
          // Check if current pathname starts with the link href
          // This ensures that the current section is highlighted
          const isActive = pathname === link.href || 
                          (link.href !== '/dashboard' && pathname.startsWith(link.href)) ||
                          (link.href === '/dashboard' && pathname === '/dashboard');
                          
          return isCollapsed ? (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9",
                isActive &&
                  "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
              )}
              asChild
            >
              <Link href={link.href} aria-label={link.title}>
                {link.icon}
              </Link>
            </Button>
          ) : (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className={cn(
                "justify-start",
                isActive &&
                  "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
              )}
              asChild
            >
              <Link href={link.href}>
                {link.icon}
                <span className="ml-2">{link.title}</span>
                {link.label && (
                  <span
                    className={cn(
                      "ml-auto",
                      !isActive && "text-gray-500"
                    )}
                  >
                    {link.label}
                  </span>
                )}
              </Link>
            </Button>
          );
        })}
      </nav>
    </div>
  )
}

export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const { userData, isLoading } = useUserData()

  // Get display name or construct from first/last name
  const getDisplayName = () => {
    if (!userData) return ""
    
    if (userData.display_name) {
      return userData.display_name
    }
    
    const firstName = userData.first_name || ""
    const lastName = userData.last_name || ""
    
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim()
    }
    
    // Fallback to email if no name data exists
    return userData.email?.split('@')[0] || "User"
  }

  return (
    <div className={cn("relative", className)}>
      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="absolute right-4 top-4 lg:hidden">
            <LayoutDashboard className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 pr-0">
          <MobileSidebar />
        </SheetContent>
      </Sheet>
      
      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden h-screen border-r px-2 lg:flex",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex w-full flex-col gap-2">
          <div className="flex h-14 items-center justify-center border-b">
            {isCollapsed ? (
              <BarChart3 className="h-6 w-6" />
            ) : (
              <div className="flex items-center gap-2 font-semibold">
                <BarChart3 className="h-6 w-6" />
                <span>Financial Dashboard</span>
              </div>
            )}
          </div>
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: "Dashboard",
                label: "",
                icon: <Home className="h-4 w-4" />,
                variant: "default",
                href: "/dashboard"
              },
              {
                title: "Transactions",
                label: "128",
                icon: <CreditCard className="h-4 w-4" />,
                variant: "ghost",
                href: "/dashboard/transactions"
              },
              {
                title: "Accounts",
                label: "9",
                icon: <Package2 className="h-4 w-4" />,
                variant: "ghost",
                href: "/dashboard/accounts"
              },
              {
                title: "Investments",
                label: "23",
                icon: <BarChart3 className="h-4 w-4" />,
                variant: "ghost",
                href: "/dashboard/investments"
              },
              {
                title: "Reports",
                label: "",
                icon: <Receipt className="h-4 w-4" />,
                variant: "ghost",
                href: "/dashboard/reports"
              },
              {
                title: "Settings",
                label: "",
                icon: <Settings className="h-4 w-4" />,
                variant: "ghost",
                href: "/dashboard/settings"
              }
            ]}
          />
          <div className="mt-auto flex flex-col gap-4 border-t p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {!isCollapsed && (
                  <div className="flex items-center">
                    <UserCircle className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-4" />
                    <div className="grid gap-1">
                      <p className="text-sm font-medium">{getDisplayName()}</p>
                      {userData?.email && (
                        <p className="text-xs text-muted-foreground">
                          {userData.email}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="ml-auto"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <Layers size={16} className="rotate-180" />
                ) : (
                  <Layers size={16} />
                )}
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MobileSidebar() {
  const { userData } = useUserData()
  
  // Get display name or construct from first/last name
  const getDisplayName = () => {
    if (!userData) return ""
    
    if (userData.display_name) {
      return userData.display_name
    }
    
    const firstName = userData.first_name || ""
    const lastName = userData.last_name || ""
    
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim()
    }
    
    // Fallback to email if no name data exists
    return userData.email?.split('@')[0] || "User"
  }
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <div className="flex items-center gap-2 font-semibold">
          <BarChart3 className="h-6 w-6" />
          <span>Financial Dashboard</span>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <Nav
          isCollapsed={false}
          links={[
            {
              title: "Dashboard",
              label: "",
              icon: <Home className="h-4 w-4" />,
              variant: "default",
              href: "/dashboard"
            },
            {
              title: "Transactions",
              label: "128",
              icon: <CreditCard className="h-4 w-4" />,
              variant: "ghost",
              href: "/dashboard/transactions"
            },
            {
              title: "Accounts",
              label: "9",
              icon: <Package2 className="h-4 w-4" />,
              variant: "ghost",
              href: "/dashboard/accounts"
            },
            {
              title: "Investments",
              label: "23",
              icon: <BarChart3 className="h-4 w-4" />,
              variant: "ghost",
              href: "/dashboard/investments"
            },
            {
              title: "Reports",
              label: "",
              icon: <Receipt className="h-4 w-4" />,
              variant: "ghost",
              href: "/dashboard/reports"
            },
            {
              title: "Settings",
              label: "",
              icon: <Settings className="h-4 w-4" />,
              variant: "ghost",
              href: "/dashboard/settings"
            }
          ]}
        />
      </ScrollArea>
      
      <div className="mt-auto border-t p-4">
        <div className="flex items-center">
          <UserCircle className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-4" />
          <div>
            <p className="text-sm font-medium">{getDisplayName()}</p>
            {userData?.email && (
              <p className="text-xs text-muted-foreground">
                {userData.email}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}