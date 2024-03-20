
export type Currency = {
  id: number
  acronym: string
  description: string
}

export type NotificationAction = 'joined' | 'rejected'
export type MembershipStatus = 'joined' | 'rejected' | 'pending'

export type Notification = {
  group?: Group
  updated_at: string,
}

export type Group = {
  id: number | undefined
  name: string
  created_at: string | undefined
}

export type UserStatus = 'active' | 'inactive'

export type User = {
  id: string,
  email: string,
  status: UserStatus,
  name: string,
  picture: string,
}

export type Membership = {
  user: User,
  status: MembershipStatus,
}

export type DetailedGroup = Group & {
  creator: User
  members: Membership[]
}

export type Identity = {
  identity: { name: string, picture: string, email: string }
  token: string
}

export type IdentityState = Identity | undefined
