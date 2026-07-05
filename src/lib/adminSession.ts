// Shared helper for admin pages: the JWT stored in localStorage expires after
// 24h (see lib/auth.ts signToken), but the admin layout only checks whether a
// token *exists* in localStorage, not whether it's still valid. That means a
// stale/expired token still shows the admin as "logged in" (name + nav visible)
// while every authenticated API call fails with 401. Call this after checking
// `data.success === false` from an admin API response to bounce back to login
// (clearing the stale session) whenever the failure was actually an expired/
// invalid token, and it'll redirect back to the current page after re-login.
export function handleUnauthorized(status: number, currentPath?: string) {
  if (status !== 401) return false

  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminData')

  const redirect = currentPath ? `?redirect=${encodeURIComponent(currentPath)}` : ''
  window.location.href = `/admin/login${redirect}`
  return true
}
