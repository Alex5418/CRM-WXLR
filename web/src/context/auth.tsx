import { createContext, useContext, useState, useCallback } from 'react'
import type { Staff } from '@/types'
import { login as apiLogin } from '@/api/auth'

const STORAGE_KEY = 'crm_current_user'

interface AuthContextValue {
  currentUser: Staff | null
  login: (staffId: string, pin: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue)

function loadUser(): Staff | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Staff | null>(loadUser)

  const login = useCallback(async (staffId: string, pin: string) => {
    const user = await apiLogin(staffId, pin)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    setCurrentUser(user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setCurrentUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
