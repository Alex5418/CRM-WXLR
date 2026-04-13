import type { Staff, Contract } from '@/types'

// Define outside the function so it isn't recreated on every check
const PRIVILEGED_ROLES = new Set(['admin', 'manager', 'finance'])

export function canViewContract(user: Staff, contract: Contract): boolean {
  // 1. 管理层与财务具有全量权限
  if (PRIVILEGED_ROLES.has(user.role)) {
    return true
  }

  return contract.visible_to?.includes(user._id) ?? false
}
