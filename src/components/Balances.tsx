import { Accessor, For, Resource, Show, createEffect, createSignal } from "solid-js"

import { Balance, CurrencyId, DetailedGroup, Expense, FormatExpense, RelativeTuple, User, UserId, } from "../types"
import { useAppContext } from "../context"
import { postExpense } from "../services"

import appStyles from '../App.module.css'
import styles from '../pages/Group.module.css'
import navStyles from './NavComponent.module.css'

export type BalancesProps = {
  balances: Accessor<Balance[]>
  group: Resource<DetailedGroup>

  onPayment(expense: Expense): void
}

export const Balances = (props: BalancesProps) => {
  const { balances, group, onPayment } = props
  const [state] = useAppContext()!

  const [users, setUsers] = createSignal<Record<UserId, User>>(usersMap(group()!))

  createEffect(() => {
    const users = usersMap(group()!)
    setUsers(users)
  })

  function relativeStatus([currencyId, amount]: [string, number]): RelativeTuple {
    const id = Number(currencyId)
    const currency = state().currencies[id].acronym
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency })

    const cost = formatter.format(Math.abs(amount))

    const status = amount < 0 ? 'lent' : 'borrowed'
    const description = status === 'lent' ? 'gets back' : 'owes'

    return [status, description, cost]
  }

  const settleUp = async (user1: User, user2: User, currencyId: CurrencyId, amount: number): Promise<void> => {
    let owes, getsBack

    if (amount > 0) {
      owes = user1
      getsBack = user2
    } else {
      owes = user2
      getsBack = user1
      amount = -amount
    }

    const expense: Expense = {
      description: "Payment",
      currency_id: currencyId,
      amount,
      date: new Date().toISOString(),
      split_strategy: {
        kind: "payment",
        payer: owes.id,
        recipient: getsBack.id
      }
    }

    await postExpense(expense, group()!.id!, state().identity!)
    onPayment(expense)
  }

  return (
    <div class={styles.balances}>
      <For each={balances()}>{(balance) => {
        const member = users()[balance.user_id]
        const totals = Object.entries(balance.total)

        // TODO - make a better description if there's more than one currency involved - moliva - 2024/03/22
        const [status, description, cost] = relativeStatus(totals[0])
        const moreCurrencies = totals.length > 1 ? '*' : ''

        // TODO - allow this header to collapse the whole thing - moliva - 2024/03/22
        return <>
          <div class={styles['balance-header']}>
            <img
              class={`${navStyles['profile-picture']} ${styles.tiny}`}
              src={member.picture}
              title={member.email}
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              alt="profile"
            />
            <label>{member.name} {description} <span style={{ color: status === 'lent' ? '#3c963c' : '#ca0808' }}>{cost}{moreCurrencies}</span> in total</label>
          </div>
          <div class={styles['balance-owers']}>
            <For each={Object.entries(balance.owes)}>{([owerId, debt]) => {
              const ower = users()[owerId]

              return <For each={Object.entries(debt).filter(([, amount]) => amount !== 0)}>{(debt) => {
                const [status, description, cost] = relativeStatus(debt)

                return (
                  <div class={styles['balance-ower']}>
                    <img
                      class={`${navStyles['profile-picture']} ${styles.tiny}`}
                      src={ower.picture}
                      title={ower.email}
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      alt="profile"
                    />
                    <label>{member.name} {description} <span style={{ color: status === 'lent' ? '#3c963c' : '#ca0808' }}>{cost}</span> {status === 'lent' ? 'from' : 'to'} {ower.name}</label>
                    <button class={`${appStyles.button} ${styles['settle-up']} `} onClick={() => settleUp(member, ower, Number(debt[0]), debt[1])}>Settle up</button>
                  </div>
                )
              }}</For>
            }}</For>
          </div>
        </>
      }}</For>
    </div>
  )
}


function usersMap(group: DetailedGroup): Record<UserId, User> {
  const entries = group.members.map(m => ([m.user.id, m.user] as const))
  return Object.fromEntries(entries)
}
