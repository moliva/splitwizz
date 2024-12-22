export type Currency = {
  id: CurrencyId
  acronym: string
  description: string
}

export type UserId = string

export type EquallySplitStrategy = {
  kind: 'equally'
  payer: UserId
  split_between: UserId[]
}

export type PaymentSplitStrategy = {
  kind: 'payment'
  payer: UserId
  recipient: UserId
}

export type SplitStrategy = EquallySplitStrategy | PaymentSplitStrategy

export type RelativeStatus = 'lent' | 'borrowed' | 'none'
export type RelativeTuple = [RelativeStatus, string, string] // status, description, split currency + amount

export type FormatExpense = Expense & {
  monthYear: string
  day: [number, string] // day of month and day of week
  payment: string
  relative?: RelativeTuple
}

export type Expense = {
  id?: number
  group_id?: number

  description: string
  currency_id: CurrencyId
  amount: number
  date: string
  split_strategy: SplitStrategy

  created_id?: UserId
  created_at?: string

  updated_id?: UserId
  updated_at?: string
}

export type NotificationStatus = 'new' | 'read' | 'archived'

export type NotificationsUpdate = NotificationUpdate & { ids: number[] }

export type NotificationUpdate = {
  status: NotificationStatus
}

export type NotificationAction = 'joined' | 'rejected'
export type MembershipStatus = 'joined' | 'rejected' | 'pending'

export type Invite = {
  kind: 'invite'

  group: Group
  created_by: User
}
export type Payment = {
  kind: 'payment'

  group: Group
  currency_id: CurrencyId
  amount: number
  date: string
  payer: User
  recipient: User
  created_by: User
}

export type NotificationKind = Invite | Payment

export type Notification = {
  id: number
  user_id: UserId
  data: NotificationKind

  status: NotificationStatus
  status_updated_at: string

  created_at: string
}

export type Group = {
  id: number | undefined
  name: string
  created_at: string | undefined

  default_currency_id: CurrencyId
  balance_config: {
    simplified: boolean
  }
}

export type DetailedGroup = Group & {
  creator: User
  members: Membership[]

  // refine group
  expenses: Expense[]
  balances: Balance[]
}

export type UserStatus = 'active' | 'inactive'

export type User = {
  id: string
  email: string
  status: UserStatus
  name: string
  picture: string
}

export type Membership = {
  user: User
  status: MembershipStatus
}

export type CurrencyId = number

export type Balance = {
  user_id: UserId
  total: {
    // Record<currency_id, amount>
    [currency_id: CurrencyId]: number
  }
  owes: {
    // Record<UserId, Record<currency_id, amount>>
    [user_id: UserId]: {
      // Record<currency_id, amount>
      [currency_id: CurrencyId]: number
    }
  }
}

export type IdToken = {
  sub: number // user id
  // fields
  name: string
  picture: string
  email: string
  // tokens
  // access_token: string
  // refresh_token: string
}

export type Identity = {
  identity: IdToken
}

export type IdentityState = Identity | undefined
