import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { TOKEN_STORAGE_KEY } from '@/api/client'
import { login as loginRequest, logout as logoutRequest, fetchMe, type AdminProfile } from '@/api/auth.api'

interface AuthContextValue {
  admin: AdminProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!token) {
      setIsLoading(false)
      return
    }

    fetchMe()
      .then((res) => setAdmin(res.admin))
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        setAdmin(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    const res = await loginRequest(email, password)
    localStorage.setItem(TOKEN_STORAGE_KEY, res.token)
    setAdmin(res.admin)
  }

  const logout = async () => {
    try {
      await logoutRequest()
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      setAdmin(null)
    }
  }

  return (
    <AuthContext.Provider value={{ admin, isAuthenticated: !!admin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
