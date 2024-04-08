import { Accessor, For, Resource, Show, createSignal } from 'solid-js'

import Fa from 'solid-fa'
import { faUserPlus, faFileInvoiceDollar, faPlus, faMoneyBill1, faTrash } from '@fortawesome/free-solid-svg-icons'

import { putExpense, postExpense, inviteUsers as doInviteUsers, deleteExpense } from '../services'
import { DetailedGroup, Expense, FormatExpense } from '../types'
import { useAppContext } from '../context'
import { monthNumberToName } from '../utils'

import { InviteModal } from './InviteModal'
import { ExpenseModal } from './ExpenseModal'

import appStyles from '../App.module.css'
import styles from '../pages/Group.module.css'
import groupStyles from './GroupComponent.module.css'

export type ExpensesProps = {
  expenses: Accessor<Record<string, FormatExpense[]>>
  group: Resource<DetailedGroup>

  onExpenseCreated(): void
  onExpenseDeleted(): void
}

export const Expenses = (props: ExpensesProps) => {
  const { expenses, group, onExpenseCreated } = props
  const [state] = useAppContext()!

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
    const promise = expense.id
      ? putExpense(expense, groupId, state()!.identity!)
      : postExpense(expense, groupId, state()!.identity!)

    promise.then(onExpenseCreated).catch(() => {
      // TODO - show error - moliva - 2023/10/11
    })

    closeExpenseModal()
  }

  const removeExpense = async (expense: Expense) => {
    try {
      const groupId = group()!.id!
      await deleteExpense(expense.id!, groupId, state()!.identity!)

      props.onExpenseDeleted()
    } catch (e) {
      // TODO - show error - moliva - 2023/10/11
    }
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
        <For each={Object.entries(expenses())}>
          {([month, expenses]: [string, FormatExpense[]]) => (
            <>
              <label class={styles['expense-date']}>
                {monthNumberToName(month.substring(5))} {month.substring(0, 4)}
              </label>

              <div class={styles.expenses}>
                <For each={expenses}>
                  {(expense, i) => (
                    <>
                      <div class={styles['expense-card']}>
                        <div class={styles['expense-day']}>
                          <span>{expense.day[1]}</span>
                          <span>{expense.day[0]}</span>
                        </div>
                        {expense.relative ? (
                          <>
                            <Fa
                              class={`${styles['expense-icon']} ${styles['expense-line']}`}
                              icon={faFileInvoiceDollar}
                            />
                            <div class={styles['expense-description']}>
                              <div style={{ display: 'inline-flex', gap: '7px' }}>
                                <label>{expense.description}</label>
                                <button
                                  title='Delete expense'
                                  style={{ 'font-size': '9px', color: '#555' }}
                                  onClick={() => removeExpense(expense)}>
                                  <Fa class={groupStyles['delete-control']} icon={faTrash} />
                                </button>
                              </div>
                              <label class={styles['expense-payment']}>{expense.payment}</label>
                            </div>
                            <div
                              class={styles['expense-relative']}
                              style={{ color: expense.relative[0] === 'lent' ? '#3c963c' : '#ca0808' }}>
                              <label>{expense.relative[1]}</label>
                              <label>{expense.relative[2]}</label>
                            </div>
                          </>
                        ) : (
                          <>
                            <Fa class={`${styles['expense-icon']} ${styles['payment']}`} icon={faMoneyBill1} />
                            <div class={styles['expense-description']}>
                              <div style={{ display: 'inline-flex', gap: '7px' }}>
                                <label class={styles['expense-payment']} style={{ color: 'white' }}>
                                  {expense.payment}
                                </label>
                                <button
                                  title='Delete expense'
                                  style={{ 'font-size': '9px', color: '#555' }}
                                  onClick={() => removeExpense(expense)}>
                                  <Fa class={groupStyles['delete-control']} icon={faTrash} />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      {i() + 1 < expenses.length ? <hr class={styles['expense-separator']} /> : null}
                    </>
                  )}
                </For>
              </div>
            </>
          )}
        </For>
      </div>
      <div class={styles.actions}>
        <button title='Invite' class={`${appStyles.button} ${styles.invite}`} onClick={() => setShowInviteModal(true)}>
          <Fa class={styles['nav-icon']} icon={faUserPlus} />
        </button>
        <button
          title='New expense'
          class={`${appStyles.button} ${styles.expense}`}
          style={{ 'padding-right': '17px' }}
          onClick={() => setShowExpenseModal(true)}>
          <Fa class={styles['nav-icon']} icon={faFileInvoiceDollar} />
          <Fa class={`${styles['nav-icon']} ${styles['nav-icon-overlap']} `} icon={faPlus} />
        </button>
      </div>
    </>
  )
}
