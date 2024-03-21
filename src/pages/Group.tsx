import { useParams } from "@solidjs/router"
import { For, Show, createEffect, createResource, createSignal, onMount } from "solid-js"

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

  // group by
  // date: string

  // description: string
  // currency_id: number
  // amount: number

  // you borrowed, you lent
  // split_strategy: SplitStrategy

  const [expenses, setExpenses] = createSignal<Record<string, Expense[]>>({})

  createEffect(() => {
    if (group() && (state().groups[group()!.id!] as any).expenses) {

      const expenses = Object.groupBy((state().groups[group()!.id!] as any).expenses as Expense[], ({ date }) => date.substring(0, 10)) as Record<string, Expense[]>

      setExpenses(expenses)
    }

  })

  return <div class={styles.center}>

    <Show when={showInviteModal()}>
      <InviteModal onConfirm={onInviteConfirm} onDiscard={() => setShowInviteModal(false)} />
    </Show>
    <Show when={showExpenseModal()}>
      <ExpenseModal group={group()!} onConfirm={onExpenseConfirm} onDiscard={closeExpenseModal} />
    </Show>
    <div class={styles.group}>
      {group.loading && <div>Loading!</div>}
      {group.error && <div>Error!</div>}
      {group() && (
        <>
          <div class={styles.main}>
            <h1 class={styles.name}>{group()!.name}</h1>
            <div class={styles['expense-dates']}>
              <For each={Object.entries(expenses())}>{([date, expenses]) => (
                <>
                  <div><label>{date}</label></div>
                  <div class={styles.expenses}>
                    <For each={expenses}>{expense => (
                      <div class={styles['expense-card']}>
                        <span>{expense.description}</span>
                        <div>
                          <span>{state().currencies[expense.currency_id].acronym}</span>
                          <span> {expense.amount}</span>
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
  </div >
}
