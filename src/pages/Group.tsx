import { Match, Switch, createEffect, createResource, createSignal } from "solid-js"
import { useParams } from "@solidjs/router"

import { fetchExpenses, fetchGroup, } from "../services"
import { DetailedGroup, FormatExpense, User } from "../types"
import { AppState, useAppContext } from "../context"

import { Expenses } from "../components/Expenses"

import styles from './Group.module.css'
import { dayNumberToName } from "../utils"

async function fetchGroupData(id: string): Promise<DetailedGroup> {
  const [state, setState] = useAppContext()!

  const group = state().groups[id]

  // check if we currently have the group loaded with detailed fields as well or force fetch
  if (group?.members) {
    return group
  }

  const identity = state().identity

  if (!identity) {
    throw 'not authentified!'
  }

  const result = await fetchGroup(identity!, Number(id))
  setState({ ...state(), groups: { ...state().groups, [id]: result } })

  return result
}

export default () => {
  const params = useParams()

  const [group] = createResource(params.id, fetchGroupData);

  const [state, setState] = useAppContext()!


  const refreshContent = async () => {
    const currentIdentity = state().identity!

    const groupId = group()!.id!
    const expenses = currentIdentity ? await fetchExpenses(currentIdentity, groupId) : undefined

    const newState = {
      ...state(),
      groups: {
        ...state().groups,
        [groupId]: {
          ...group()!,
          expenses
        }
      }
    }

    setState(newState)

  }

  let alreadyFetch = false
  createEffect(async () => {
    if (!alreadyFetch) {
      if (group()) {
        await refreshContent()
        alreadyFetch = true
      }
    }
  })

  const [expenses, setExpenses] = createSignal<Record<string, FormatExpense[]>>({})


  const [tab, setTab] = createSignal(0)
  const updateTab = (index: number) => () => setTab(index)

  createEffect(() => {
    if (group() && (state().groups[group()!.id!] as any).expenses) {

      const expenses = formatExpenses(state(), group()!)

      setExpenses(expenses)
    }
  })

  return (
    <div class={styles.center}>
      <div class={styles.tab}>
        {group.loading && <div>Loading!</div>}
        {group.error && <div>Error!</div>}
        {group() && (
          <>
            <div class={styles.main}>
              <h1 class={styles.name}>{group()!.name}</h1>
              <ul class={styles['tab-group']}>
                <li class={styles['tab-item']} classList={{ [styles.selected]: tab() === 0 }} onClick={updateTab(0)}>
                  Expenses
                </li>
                <li class={styles['tab-item']} classList={{ [styles.selected]: tab() === 1 }} onClick={updateTab(1)}>
                  Balances
                </li>
              </ul>
              <hr class={styles['divider']} />
              <Switch>
                <Match when={tab() === 0}>
                  <Expenses expenses={expenses} group={group} onExpenseCreated={refreshContent} />
                </Match>
                <Match when={tab() === 1}>
                  Balances
                </Match>
              </Switch>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function formatExpenses(state: AppState, group: DetailedGroup): Record<string, FormatExpense[]> {

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

    const status = expense.split_strategy.payer === me.id ? 'lent' : 'borrowed'
    const description = status === 'lent' ? 'you lent' : 'you borrowed'
    const cost = formatter.format(expense.amount / expense.split_strategy.split_between.length)
    const relative = [status, description, cost]

    return {
      ...expense,
      monthYear: expense.date.substring(0, 7),
      day: [date.getDate(), dayNumberToName(date.getDay())],
      payment: `${userIdToDisplay(expense.split_strategy.payer)} paid ${formatter.format(expense.amount)}`,
      relative
    }
  })

  return Object.groupBy(expenses, ({ monthYear }) => monthYear) as Record<string, FormatExpense[]>
}
