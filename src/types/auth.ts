export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  provider: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

export type OAuthProvider = 'github' | 'google'
