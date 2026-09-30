export type Role = 'admin' | 'user'

export interface User {
  id: string
  name: string
  role: Role
}
