

export type Group = {
  id: number | undefined
  name: string
  created_at: string | undefined
}

export type Identity = {
  identity: any
  token: string
}

export type IdentityState = Identity | undefined
