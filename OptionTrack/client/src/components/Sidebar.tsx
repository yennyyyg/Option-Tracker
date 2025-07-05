import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  Home,
  Briefcase,
  DollarSign,
  Target,
  Calendar,
  TrendingUp,
  BarChart3,
  Bell,
  Settings,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Positions", href: "/positions", icon: Briefcase },
  { name: "Premium Tracker", href: "/premium-tracker", icon: DollarSign },
  { name: "Assignment Center", href: "/assignment-center", icon: Target },
  { name: "Rolling Calendar", href: "/rolling-calendar", icon: Calendar },
  { name: "Greeks Monitor", href: "/greeks-monitor", icon: TrendingUp },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Risk Alerts", href: "/risk-alerts", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
]

interface SidebarProps {
  className?: string
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ className, isMobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation()
  console.log('Sidebar: Current location:', location.pathname)

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <TrendingUp className="h-6 w-6" />
          <span className="">OptionTrack</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="grid gap-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => {
                  console.log('Sidebar: Navigating to:', item.href, item.name)
                  if (onMobileClose) onMobileClose()
                }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </div>
  )

  if (isMobileOpen !== undefined) {
    return (
      <Sheet open={isMobileOpen} onOpenChange={onMobileClose}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="space-y-4 py-4 h-full bg-card border-r">
        <SidebarContent />
      </div>
    </div>
  )
}