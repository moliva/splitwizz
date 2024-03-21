import { useParams } from "@solidjs/router"
import { For, Match, Show, Switch, createEffect, createResource, createSignal } from "solid-js"

import { fetchExpenses, putExpense, postExpense, fetchGroup, inviteUsers as doInviteUsers } from "../services"
import { DetailedGroup, Expense } from "../types"
import { useAppContext } from "../context"

import { InviteModal } from "../components/InviteModal"
import { ExpenseModal } from "../components/ExpenseModal"

import appStyles from '../App.module.css'
import styles from './Group.module.css'

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

  const [showInviteModal, setShowInviteModal] = createSignal(false)
  const [showExpenseModal, setShowExpenseModal] = createSignal(false)
  const [currentExpense, setCurrentExpense] = createSignal<string | undefined>() // this will use a `Expense` type

  const onInviteConfirm = (email: string) => {
    setShowInviteModal(false)

    const identity = state().identity

    if (!identity) {
      throw 'not authentified!'
    }

    doInviteUsers(identity!, group()!.id!, [email])
  }

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

  const onExpenseConfirm = (expense: Expense) => {
    const groupId = group()!.id!
    const promise = expense.id ? putExpense(expense, groupId, state()!.identity!) : postExpense(expense, groupId, state()!.identity!)

    promise
      .then(refreshContent)
      .catch(() => {
        // TODO - show error - moliva - 2023/10/11
      })

    closeExpenseModal()

  }

  const closeExpenseModal = () => {
    setShowExpenseModal(false)
    setCurrentExpense(undefined)
  }

  type RelativeStatus = 'lent' | 'borrowed' | 'none'

  type FormatExpense = Expense & {
    monthYear: string
    day: [number, string] // day of month and day of week
    payment: string,
    relative: [RelativeStatus, string, string] // status, description, split currency + amount
  }

  const [expenses, setExpenses] = createSignal<Record<string, FormatExpense[]>>({})

  const dayNumberToName = (d: number) => {
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


  const monthNumberToName = (m: string) => {
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

  const [tab, setTab] = createSignal(0)
  const updateTab = (index: number) => () => setTab(index)

  createEffect(() => {
    if (group() && (state().groups[group()!.id!] as any).expenses) {

      const exs = ((state().groups[group()!.id!] as any).expenses as Expense[]).map(e => {
        const d = new Date(Date.parse(e.date))
        const me = group()!.members.find(m => m.user.email === state().identity?.identity.email)!.user

        const userIdToUser = (id: string) => {
          return group()?.members.find(m => m.user.id === id)?.user
        }

        const userIdToDisplay = (id: string) => {
          const user = userIdToUser(id)!
          return user === me ? "You" : user.name
        }

        const currency = state().currencies[e.currency_id].acronym

        const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency })
        const status = e.split_strategy.payer === me.id ? 'lent' : 'borrowed'
        const description = status === 'lent' ? 'you lent' : 'you borrowed'
        const cost = formatter.format(e.amount / e.split_strategy.split_between.length)

        return {
          ...e,
          monthYear: e.date.substring(0, 7),
          day: [d.getDate(), dayNumberToName(d.getDay())],
          payment: `${userIdToDisplay(e.split_strategy.payer)} paid ${formatter.format(e.amount)}`,
          relative: [status, description, cost]
        }
      })
      const expenses = Object.groupBy(exs, ({ monthYear }) => monthYear) as Record<string, FormatExpense[]>

      setExpenses(expenses)
    }

  })

  return (
    <div class={styles.center}>
      <Show when={showInviteModal()}>
        <InviteModal onConfirm={onInviteConfirm} onDiscard={() => setShowInviteModal(false)} />
      </Show>
      <Show when={showExpenseModal()}>
        <ExpenseModal group={group()!} onConfirm={onExpenseConfirm} onDiscard={closeExpenseModal} />
      </Show>
      <ul class={styles['tab-group']}>
        <li class={styles['tab-item']} classList={{ [styles.selected]: tab() === 0 }} onClick={updateTab(0)}>
          Expenses
        </li>
        <li class={styles['tab-item']} classList={{ [styles.selected]: tab() === 1 }} onClick={updateTab(1)}>
          Balances
        </li>
      </ul>
      <hr class={styles['divider']} />
      <div class={styles["tab"]}>
        <Switch>
          <Match when={tab() === 0}>
            <div class={styles.group}>
              {group.loading && <div>Loading!</div>}
              {group.error && <div>Error!</div>}
              {group() && (
                <>
                  <div class={styles.main}>
                    <h1 class={styles.name}>{group()!.name}</h1>
                    <div class={styles['expense-dates']}>
                      <For each={Object.entries(expenses())}>{([month, expenses]) => (
                        <>
                          <label class={styles['expense-date']}>{monthNumberToName(month.substring(5))} {month.substring(0, 4)}</label>

                          <div class={styles.expenses}>
                            <For each={expenses}>{expense => (
                              <div class={styles['expense-card']}>
                                <div class={styles['expense-day']}>
                                  <span>{expense.day[1]}</span>
                                  <span>{expense.day[0]}</span>
                                </div>
                                <div class={styles['expense-description']}>
                                  <label>{expense.description}</label>
                                  <label class={styles['expense-payment']}>{expense.payment}</label>
                                </div>
                                <div class={styles['expense-relative']} style={{ color: expense.relative[0] === 'lent' ? '#3c963c' : '#ca0808' }}>
                                  <label>{expense.relative[1]}</label>
                                  <label class={styles['expense-payment1']}>{expense.relative[2]}</label>
                                </div>
                              </div>
                            )}</For>
                          </div>
                        </>
                      )}</For>
                    </div>
                  </div>
                  <div class={styles.actions}>
                    <button class={`${appStyles.button} ${styles.invite}`} onClick={() => setShowInviteModal(true)}>Invite</button>
                    <button class={`${appStyles.button} ${styles.expense}`} onClick={() => setShowExpenseModal(true)}>Expense</button>
                  </div>
                </>
              )}
            </div>
          </Match>
          <Match when={tab() === 1}>
            Balances
          </Match>
        </Switch>
      </div>
    </div>
  )
}
