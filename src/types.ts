
export type LineFormat = {
  line?: string
  checkbox?: boolean
  check?: boolean
  blur?: boolean
  link?: string
}

export type Content = [LineFormat, Content][]

export type Note = {
  id: number
  name: string
  color: string
  content: Content
  tags: string[]
}

export type Identity = {
  identity: any
  token: string
}

export type IdentityState = Identity | undefined
