
export type NotificationAction = 'joined' | 'rejected'

export type Notification = {
  group?: Group
  updated_at: string,
}

export type Group = {
  id: number | undefined
  name: string
  created_at: string | undefined
}

export type DetailedGroup = Group & {
  // other stuff
}

export type Identity = {
  identity: any
  token: string
}

export type IdentityState = Identity | undefined
