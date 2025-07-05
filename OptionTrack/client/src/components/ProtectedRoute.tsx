import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  console.log('ProtectedRoute: Component rendering...')
  
  try {
    const { user, isLoading } = useAuth()
    
    console.log('ProtectedRoute: Auth state - user:', user, 'isLoading:', isLoading)

    if (isLoading) {
      console.log('ProtectedRoute: Still loading, showing loading state')
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontFamily: 'Arial, sans-serif'
        }}>
          Loading...
        </div>
      )
    }

    if (!user) {
      console.log('ProtectedRoute: No user found, redirecting to login')
      return <Navigate to="/login" replace />
    }

    console.log('ProtectedRoute: User authenticated, rendering children')
    return <>{children}</>
  } catch (error) {
    console.error('ProtectedRoute: Error in component:', error)
    return (
      <div style={{ padding: '20px', color: 'red', fontFamily: 'Arial, sans-serif' }}>
        <h1>Protected Route Error</h1>
        <p>Failed to check authentication. Check the console for details.</p>
        <pre>{String(error)}</pre>
      </div>
    )
  }
}