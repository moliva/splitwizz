import { AppState } from "./context"
import { DetailedGroup, FormatExpense, User } from "./types"

export function copyToClipboard(value: string): void {
  navigator.clipboard.writeText(value)
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const dayNumberToName = (d: number): string => {
  switch (d) {
    case 0: return 'Sun'
    case 1: return 'Mon'
    case 2: return 'Tue'
    case 3: return 'Wed'
    case 4: return 'Thu'
    case 5: return 'Fri'
    case 6: return 'Sat'
    default: throw 'day number out of range'
  }
}

export const monthNumberToName = (m: string): string => {
  switch (m) {
    case '01': return 'January'
    case '02': return 'February'
    case '03': return 'March'
    case '04': return 'April'
    case '05': return 'May'
    case '06': return 'June'
    case '07': return 'July'
    case '08': return 'August'
    case '09': return 'September'
    case '10': return 'October'
    case '11': return 'November'
    case '12': return 'December'
    default: throw `month number out of range ${m}`
  }
}

export function formatExpenses(state: AppState, group: DetailedGroup): Record<string, FormatExpense[]> {

  const expenses = state.groups[group.id!].expenses.map(expense => {
    const date = new Date(Date.parse(expense.date))
    const me = group.members.find(m => m.user.email === state.identity?.identity.email)!.user

    const userIdToUser = (id: string): User => group.members.find(m => m.user.id === id)?.user!

    const userIdToDisplay = (id: string): string => {
      const user = userIdToUser(id)!

      return user === me ? "You" : user.name
    }

    // TODO - cache formatters per currency - moliva - 2024/03/22
    const currency = state.currencies[expense.currency_id].acronym
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency })

    // Boris paid Constanza $ 10000
    let relative, payment
    switch (expense.split_strategy.kind) {
      case 'equally': {
        const status = expense.split_strategy.payer === me.id ? 'lent' : 'borrowed'
        const description = status === 'lent' ? 'you lent' : 'you borrowed'
        const cost = formatter.format(expense.amount / expense.split_strategy.split_between.length)
        relative = [status, description, cost]

        payment = `${userIdToDisplay(expense.split_strategy.payer)} paid ${formatter.format(expense.amount)}`
        break;
      }
      case 'payment': {
        payment = `${userIdToDisplay(expense.split_strategy.payer)} paid ${userIdToDisplay(expense.split_strategy.recipient)} ${formatter.format(expense.amount)}`
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

  return Object.groupBy(expenses, ({ monthYear }) => monthYear) as Record<string, FormatExpense[]>
}
