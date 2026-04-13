import { createContext, useContext } from 'react'
import type { Staff } from '@/types'
import { mockStaff } from '@/mock/data'

// 1. 定义 context 的类型
interface AuthContext {
    currentUser: Staff
  }

  // 2. 创建 context
const AuthContext = createContext<AuthContext>(
    {} as AuthContext
  )

  // 3. Provider — mock 阶段直接用 mockStaff[0]
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const currentUser = mockStaff[0] // 这里可以切换不同的用户来测试权限
    return (
      <AuthContext.Provider value={{ currentUser }}>
        {children}
      </AuthContext.Provider>
    )
  }

  // 4. 导出 hook
export function useAuth() {
    return useContext(AuthContext)
  }

  