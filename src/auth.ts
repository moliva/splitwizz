import { Accessor, Setter } from 'solid-js'
import { AppState } from './context'
import { getCookie } from './cookies'
import { IdToken } from './types'

export const ID_TOKEN_COOKIE = 'id_token'

export function handleAuth(state: Accessor<AppState>, setState: Setter<AppState>): void {
  if (!state().identity) {
    let identity: IdToken | undefined = undefined

    // check in cookies
    let token = getCookie(ID_TOKEN_COOKIE)

    if (token !== null) {
      const idToken = token.split('.')[1]

      const decoded = atob(idToken)
      identity = JSON.parse(decoded) as IdToken
    }

    if (identity) {
      const newIdentityState = { identity }
      setState({ ...state(), identity: newIdentityState })
    }
  }
}
