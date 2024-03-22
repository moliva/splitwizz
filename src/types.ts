
export type Currency = {
  id: number
  acronym: string
  description: string
}

export type UserId = string

export type EquallySplitStrategy = {
  kind: 'equally'
  payer: UserId,
  split_between: UserId[],
}

export type SplitStrategy = EquallySplitStrategy

export type RelativeStatus = 'lent' | 'borrowed' | 'none'

export type FormatExpense = Expense & {
  monthYear: string
  day: [number, string] // day of month and day of week
  payment: string,
  relative: [RelativeStatus, string, string] // status, description, split currency + amount
}

export type Expense = {
  id?: number
  group_id?: number

  description: string
  currency_id: number
  amount: number
  date: string
  split_strategy: SplitStrategy

  created_id?: UserId
  created_at?: string

  updated_id?: UserId
  updated_at?: string
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

  default_currency_id: number
  balance: {
    simplified: boolean
  }
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

  // refine group
  expenses: Expense[]
}

export type Identity = {
  identity: { name: string, picture: string, email: string }
  token: string
}

export type IdentityState = Identity | undefined
