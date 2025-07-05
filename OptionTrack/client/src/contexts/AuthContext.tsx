import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../api/auth';
import { toast } from '../hooks/useToast';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  console.log('AuthContext: useAuth hook called')
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log('AuthProvider: Component initializing...')
  
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  console.log('AuthProvider: Rendering with user:', user, 'isLoading:', isLoading)

  useEffect(() => {
    console.log('AuthProvider: useEffect - checking for existing auth token')
    const token = localStorage.getItem('accessToken')
    console.log('AuthProvider: Found token in localStorage:', token ? `${token.substring(0, 20)}...` : 'null')
    
    if (token) {
      console.log('AuthProvider: Token found, attempting to validate')
      try {
        // Try to decode the JWT token to get user info
        const payload = JSON.parse(atob(token.split('.')[1]))
        console.log('AuthProvider: Decoded token payload:', payload)
        
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          console.log('AuthProvider: Token is valid, setting user')
          setUser({
            id: payload.userId || payload.sub || payload.id,
            email: payload.email || 'user@example.com'
          })
        } else {
          console.log('AuthProvider: Token is expired, removing from localStorage')
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
      } catch (error) {
        console.error('AuthProvider: Error decoding token:', error)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      }
    } else {
      console.log('AuthProvider: No existing token found')
    }
    
    setIsLoading(false)
    console.log('AuthProvider: Initial auth check completed')
  }, [])

  const login = async (email: string, password: string) => {
    console.log('AuthProvider: Login attempt for email:', email);
    try {
      console.log('AuthProvider: About to call apiLogin');
      const response = await apiLogin(email, password);
      console.log('AuthProvider: Login response received - type:', typeof response);
      console.log('AuthProvider: Login response keys:', response ? Object.keys(response) : 'no response');
      console.log('AuthProvider: Login response.success:', response?.success);
      console.log('AuthProvider: Login response.data:', response?.data ? 'present' : 'missing');
      
      if (response && response.success && response.data) {
        console.log('AuthProvider: Login successful, storing tokens');
        console.log('AuthProvider: AccessToken present:', !!response.data.accessToken);
        console.log('AuthProvider: RefreshToken present:', !!response.data.refreshToken);
        
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);

        // Decode token to get user info
        const payload = JSON.parse(atob(response.data.accessToken.split('.')[1]));
        console.log('AuthProvider: Setting user from login response:', payload);

        setUser({
          id: payload.userId || payload.sub || payload.id,
          email: payload.email || email
        });

        toast({
          title: "Success",
          description: "Logged in successfully",
        });
      } else {
        console.error('AuthProvider: Login failed - invalid response structure');
        console.error('AuthProvider: Response structure check - success:', !!response?.success, 'data:', !!response?.data);
        throw new Error('Invalid login response');
      }
    } catch (error: any) {
      console.error('AuthProvider: Login error:', error);
      toast({
        title: "Error",
        description: error.message || "Login failed",
        variant: "destructive",
      });
      throw error;
    }
  }

  const register = async (email: string, password: string) => {
    console.log('AuthProvider: Register attempt for email:', email)
    try {
      const response = await apiRegister(email, password)
      console.log('AuthProvider: Register response:', response)
      
      if (response.success && response.data) {
        console.log('AuthProvider: Registration successful, storing access token only')
        localStorage.setItem('accessToken', response.data.accessToken)
        
        // Decode token to get user info
        const payload = JSON.parse(atob(response.data.accessToken.split('.')[1]))
        console.log('AuthProvider: Setting user from register response:', payload)
        
        setUser({
          id: payload.userId || payload.sub || payload.id,
          email: payload.email || email
        })
        
        toast({
          title: "Success",
          description: "Account created successfully",
        })
      } else {
        console.error('AuthProvider: Registration failed - invalid response structure')
        throw new Error('Invalid registration response')
      }
    } catch (error: any) {
      console.error('AuthProvider: Registration error:', error)
      toast({
        title: "Error",
        description: error.message || "Registration failed",
        variant: "destructive",
      })
      throw error
    }
  }

  const logout = () => {
    console.log('AuthProvider: Logout called')
    try {
      apiLogout()
    } catch (error) {
      console.error('AuthProvider: Logout API call failed:', error)
    }
    
    console.log('AuthProvider: Clearing tokens and user state')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
    
    toast({
      title: "Success",
      description: "Logged out successfully",
    })
  }

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}