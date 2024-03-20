import { JSXElement, createContext, createSignal, useContext } from "solid-js";
import { Currency, DetailedGroup, Identity } from "./types";

export type AppState = {
  identity: Identity | undefined
  groups: Record<string, DetailedGroup>
  currencies: Currency[]
}

const INITIAL_STATE: AppState = {
  identity: undefined,
  groups: {},
  currencies: [],
}

const appState = createSignal(INITIAL_STATE)

const AppContext = createContext<typeof appState>()

export const Provider = (props: { children: JSXElement }) => (
  <AppContext.Provider value={appState}>{props.children}</AppContext.Provider>
);

export const useAppContext = () => useContext(AppContext)!
