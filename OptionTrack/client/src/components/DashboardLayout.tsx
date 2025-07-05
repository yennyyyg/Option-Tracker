import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { DashboardHeader } from "./DashboardHeader"
import { useMobile } from "@/hooks/useMobile"

export function DashboardLayout() {
  console.log('DashboardLayout: Component rendering...')
  
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useMobile()

  console.log('DashboardLayout: isMobile:', isMobile, 'sidebarOpen:', sidebarOpen)

  // Check layout structure
  console.log('DashboardLayout: Checking layout structure...')

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className="hidden lg:flex lg:flex-shrink-0">
            <Sidebar />
          </div>
        )}

        {/* Mobile Sidebar */}
        <Sidebar 
          isMobileOpen={sidebarOpen} 
          onMobileClose={() => {
            console.log('DashboardLayout: Mobile sidebar closing')
            setSidebarOpen(false)
          }} 
        />

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader 
            onMenuClick={() => {
              console.log('DashboardLayout: Menu clicked, opening sidebar')
              setSidebarOpen(true)
            }} 
          />
          
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}