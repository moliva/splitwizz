import { Accessor, Setter } from 'solid-js'
import { AppState } from './context'
import { getCookie, removeCookie } from './cookies'
import { logout as logoutApi } from './services'
import { DetailedGroup, FormatExpense, IdToken, Identity, User } from './types'

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
      debugger
      const newIdentityState = { identity }
      setState({ ...state(), identity: newIdentityState })
    }
  }
}

export async function logout(identity: Identity) {
  removeCookie(ID_TOKEN_COOKIE)
  try {
    await logoutApi(identity)
  } catch {}
  document.location = import.meta.env.BASE_URL
}

export function copyToClipboard(value: string): void {
  navigator.clipboard.writeText(value)
}

export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export const dayNumberToName = (d: number): string => {
  switch (d) {
    case 0:
      return 'Sun'
    case 1:
      return 'Mon'
    case 2:
      return 'Tue'
    case 3:
      return 'Wed'
    case 4:
      return 'Thu'
    case 5:
      return 'Fri'
    case 6:
      return 'Sat'
    default:
      throw 'day number out of range'
  }
}

export const monthNumberToName = (m: string): string => {
  switch (m) {
    case '01':
      return 'January'
    case '02':
      return 'February'
    case '03':
      return 'March'
    case '04':
      return 'April'
    case '05':
      return 'May'
    case '06':
      return 'June'
    case '07':
      return 'July'
    case '08':
      return 'August'
    case '09':
      return 'September'
    case '10':
      return 'October'
    case '11':
      return 'November'
    case '12':
      return 'December'
    default:
      throw `month number out of range ${m}`
  }
}

export function formatExpenses(state: AppState, group: DetailedGroup): Record<string, FormatExpense[]> {
  const expenses = state.groups[group.id!].expenses.map(expense => {
    const date = new Date(Date.parse(expense.date))
    const me = group.members.find(m => m.user.email === state.identity?.identity.email)!.user

    const userIdToUser = (id: string): User => group.members.find(m => m.user.id === id)?.user!

    const userIdToDisplay = (id: string): string => {
      const user = userIdToUser(id)!

      return user === me ? 'You' : userName(user)
    }

    // TODO - cache formatters per currency - moliva - 2024/03/22
    const currency = state.currencies[expense.currency_id].acronym
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    })

    // Boris paid Constanza $ 10000
    let relative, payment
    switch (expense.split_strategy.kind) {
      case 'equally': {
        const status = expense.split_strategy.payer === me.id ? 'lent' : 'borrowed'
        const description = status === 'lent' ? 'you lent' : 'you borrowed'
        const cost = formatter.format(expense.amount / expense.split_strategy.split_between.length)
        relative = [status, description, cost]

        payment = `${userIdToDisplay(expense.split_strategy.payer)} paid ${formatter.format(expense.amount)}`
        break
      }
      case 'payment': {
        payment = `${userIdToDisplay(expense.split_strategy.payer)} paid ${userIdToDisplay(
          expense.split_strategy.recipient
        )} ${formatter.format(expense.amount)}`
      }
    }

    return {
      ...expense,
      monthYear: expense.date.substring(0, 7),
      day: [date.getDate(), dayNumberToName(date.getDay())],
      payment,
      relative
    }
  })

  return groupBy(expenses, ({ monthYear }) => monthYear) as Record<string, FormatExpense[]>
}

/**
 * "Polyfill" for Object#groupBy for versions that still don't support this API
 */
function groupBy<T>(array: T[], keySelector: (each: T) => PropertyKey): Partial<Record<PropertyKey, T[]>> {
  if (Object.groupBy) {
    return Object.groupBy(array, keySelector)
  } else {
    console.debug('Object#groupBy not found, using own version')
    const grouped: Record<PropertyKey, T[]> = {}

    for (const each of array) {
      const key = keySelector(each)
      let values = grouped[key]
      if (values) {
        values.push(each)
      } else {
        grouped[key] = [each]
      }
    }

    return grouped
  }
}

export function userName(user: User): string {
  const indexBlank = user.name.indexOf(' ')

  return user.name.slice(0, indexBlank == -1 ? 0 : indexBlank)
}

export function formatError(contextMessage: string, e: any): string {
  return `${contextMessage}\n\n${JSON.stringify(e?.stack ?? e?.message ?? e)}`
}
