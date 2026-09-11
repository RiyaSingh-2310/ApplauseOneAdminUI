import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { onUnauthorized } from '@/lib/http'
import { clearSession, readSession, writeSession } from '@/lib/session'
import { adminAuthService } from '@/services/adminAuth.service'
import type { AdminUser, LoginInput } from '@/types'

interface AuthContextValue {
  user: AdminUser | null
  ready: boolean
  login: (input: LoginInput) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [ready, setReady] = useState(() => !readSession())

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  useEffect(() => {
    const session = readSession()
    if (!session) return
    adminAuthService
      .me()
      .then((next) => setUser(next))
      .catch(() => {
        clearSession()
        setUser(null)
      })
      .finally(() => setReady(true))
  }, [])

  useEffect(() => onUnauthorized(logout), [logout])

  useEffect(() => {
    const sync = () => {
      if (!readSession()) logout()
    }
    window.addEventListener('focus', sync)
    return () => window.removeEventListener('focus', sync)
  }, [logout])

  const login = useCallback(async (input: LoginInput) => {
    const session = await adminAuthService.login(input)
    writeSession(session)
    setUser(session.user)
  }, [])

  const value = useMemo(
    () => ({ user, ready, login, logout }),
    [user, ready, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
