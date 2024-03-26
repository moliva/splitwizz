import { Accessor, For, Resource, Show, createSignal } from "solid-js"

import Fa from "solid-fa"
import { faUserPlus, faFileInvoiceDollar, faPlus, faMoneyBill1 } from "@fortawesome/free-solid-svg-icons"

import { putExpense, postExpense, inviteUsers as doInviteUsers } from "../services"
import { DetailedGroup, Expense, FormatExpense, } from "../types"
import { useAppContext } from "../context"
import { monthNumberToName } from "../utils"

import { InviteModal } from "./InviteModal"
import { ExpenseModal } from "./ExpenseModal"

import appStyles from '../App.module.css'
import styles from '../pages/Group.module.css'

export type ExpensesProps = {
  expenses: Accessor<Record<string, FormatExpense[]>>
  group: Resource<DetailedGroup>

  onExpenseCreated(): void
}

export const Expenses = (props: ExpensesProps) => {
  const { expenses, group, onExpenseCreated } = props
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

  const onExpenseConfirm = (expense: Expense) => {
    const groupId = group()!.id!
    const promise = expense.id ? putExpense(expense, groupId, state()!.identity!) : postExpense(expense, groupId, state()!.identity!)

    promise
      .then(onExpenseCreated)
      .catch(() => {
        // TODO - show error - moliva - 2023/10/11
      })

    closeExpenseModal()

  }

  const closeExpenseModal = () => {
    setShowExpenseModal(false)
    setCurrentExpense(undefined)
  }

  return (
    <>
      <Show when={showInviteModal()}>
        <InviteModal onConfirm={onInviteConfirm} onDiscard={() => setShowInviteModal(false)} />
      </Show>
      <Show when={showExpenseModal()}>
        <ExpenseModal group={group()!} onConfirm={onExpenseConfirm} onDiscard={closeExpenseModal} />
      </Show>
      <div class={styles['expense-dates']}>
        <For each={Object.entries(expenses())}>{([month, expenses]: [string, FormatExpense[]]) => (
          <>
            <label class={styles['expense-date']}>{monthNumberToName(month.substring(5))} {month.substring(0, 4)}</label>

            <div class={styles.expenses}>
              <For each={expenses}>{expense => (
                <div class={styles['expense-card']}>
                  <div class={styles['expense-day']}>
                    <span>{expense.day[1]}</span>
                    <span>{expense.day[0]}</span>
                  </div>
                  {expense.relative ? (
                    <Fa class={`${styles['expense-icon']} ${styles['expense-line']}`} icon={faFileInvoiceDollar} />
                  ) : (
                    <Fa class={`${styles['expense-icon']} ${styles['payment']}`} icon={faMoneyBill1} />
                  )}
                  {expense.relative ? (
                    <>
                      <div class={styles['expense-description']}>
                        <label>{expense.description}</label>
                        <label class={styles['expense-payment']}>{expense.payment}</label>
                      </div>
                      <div class={styles['expense-relative']} style={{ color: expense.relative[0] === 'lent' ? '#3c963c' : '#ca0808' }}>
                        <label>{expense.relative[1]}</label>
                        <label>{expense.relative[2]}</label>
                      </div>
                    </>
                  ) : (
                    <div class={styles['expense-description']}>
                      <label class={styles['expense-payment']} style={{ color: 'white' }}>{expense.payment}</label>
                    </div>
                  )}
                </div>
              )}</For>
            </div>
          </>
        )
        }</For>
      </div >
      <div class={styles.actions}>
        <button title="Invite" class={`${appStyles.button} ${styles.invite}`} onClick={() => setShowInviteModal(true)}>

          <Fa class={styles['nav-icon']} icon={faUserPlus} />
        </button>
        <button title="New expense" class={`${appStyles.button} ${styles.expense}`} style={{ "padding-right": "17px" }} onClick={() => setShowExpenseModal(true)}>
          <Fa class={styles['nav-icon']} icon={faFileInvoiceDollar} />
          <Fa class={`${styles['nav-icon']} ${styles['nav-icon-overlap']} `} icon={faPlus} />
        </button>
      </div>
    </>
  )
}
