import { JSXElement, createContext, createSignal, useContext } from 'solid-js'

import { Currency, DetailedGroup, Identity } from './types'

export type AppState = {
  identity: Identity | undefined
  groups: Record<string, DetailedGroup>
  currencies: Record<number, Currency>
  error?: any
}

const INITIAL_STATE: AppState = {
  identity: undefined,
  groups: {},
  currencies: []
}

const [state, setState] = createSignal(INITIAL_STATE)

const setGroup = (group: Partial<DetailedGroup>) => {
  setState({
    ...state(),
    groups: {
      ...state().groups,
      [group.id!]: {
        ...(state().groups[group.id!] ?? {}),
        ...group
      }
    }
  })
}

const setError = (error?: any) => {
  console.error(error)

  setState({
    ...state(),
    error
  })
}

const appState = [state, { setState, setError, setGroup }] as const

const AppContext = createContext<typeof appState>()

export const Provider = (props: { children: JSXElement }) => (
  <AppContext.Provider value={appState}>{props.children}</AppContext.Provider>
)

export const useAppContext = () => useContext(AppContext)!
