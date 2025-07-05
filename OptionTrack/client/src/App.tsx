import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./contexts/AuthContext"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { DashboardLayout } from "./components/DashboardLayout"
import { Dashboard } from "./pages/Dashboard"
import { Positions } from "./pages/Positions"
import { PremiumTracker } from "./pages/PremiumTracker"
import { AssignmentCenter } from "./pages/AssignmentCenter"
import { RollingCalendar } from "./pages/RollingCalendar"
import { GreeksMonitor } from "./pages/GreeksMonitor"
import { Analytics } from "./pages/Analytics"
import { RiskAlerts } from "./pages/RiskAlerts"
import { Settings } from "./pages/Settings"

function App() {
  console.log('App: Component rendering started...')

  try {
    console.log('App: Initializing providers and router...')
    
    return (
      <AuthProvider>
        <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="positions" element={<Positions />} />
                <Route path="premium-tracker" element={<PremiumTracker />} />
                <Route path="assignment-center" element={<AssignmentCenter />} />
                <Route path="rolling-calendar" element={<RollingCalendar />} />
                <Route path="greeks-monitor" element={<GreeksMonitor />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="risk-alerts" element={(() => {
                  console.log('App: RiskAlerts route accessed');
                  return <RiskAlerts />;
                })()} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </Router>
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    )
  } catch (error) {
    console.error('App: Error during component rendering:', error)
    return (
      <div style={{ padding: '20px', color: 'red', fontFamily: 'Arial, sans-serif' }}>
        <h1>App Component Error</h1>
        <p>Failed to render the application. Check the console for details.</p>
        <pre>{String(error)}</pre>
      </div>
    )
  }
}

export default App