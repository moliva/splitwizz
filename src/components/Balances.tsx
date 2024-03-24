import { Accessor, For, Resource, createEffect, createSignal } from "solid-js"

import { Balance, CurrencyId, DetailedGroup, Expense, RelativeTuple, User, UserId, } from "../types"
import { useAppContext } from "../context"
import { postExpense } from "../services"

import { ProfilePicture } from "./ProfilePicture"

import appStyles from '../App.module.css'
import styles from '../pages/Group.module.css'

export type BalancesProps = {
  balances: Accessor<Balance[]>
  group: Resource<DetailedGroup>

  onPayment(expense: Expense): void
}

export const Balances = (props: BalancesProps) => {
  const { balances, group, onPayment } = props
  const [state] = useAppContext()!

  const [wip, setWip] = createSignal(Object.fromEntries(balances().flatMap((b) => Object.entries(b.owes).flatMap(([owerId, c]) => Object.entries(c).map(([currencyId]) => [b.user_id + '_' + owerId + "_" + currencyId, false])))))

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

    setWip({
      ...wip(),
      [getsBack.id + "_" + owes.id + "_" + currencyId]: true,
      [owes.id + "_" + getsBack.id + "_" + currencyId]: true
    })

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

  const isSettledUp = balances().reduce((settled, b) => settled && Object.values(b.total).every(a => a === 0), true)

  return (
    <div class={styles.balances}>
      {isSettledUp
        ? <div class={styles['settled-up-container']}><label class={styles['settled-up']}>All settled! 🪄</label></div>
        : <For each={balances()}>{(balance) => {
          const member = users()[balance.user_id]
          const totals = Object.entries(balance.total)

          // TODO - make a better description if there's more than one currency involved - moliva - 2024/03/22
          const total = totals.find(([, a]) => a !== 0)!
          const [status, description, cost] = relativeStatus(total)

          const moreCurrencies = totals.length > 1 ? '*' : ''

          // TODO - allow this header to collapse the whole thing - moliva - 2024/03/22
          return <>
            <div class={styles['balance-header']}>
              <ProfilePicture title={member.email} picture={member.picture} />
              <label>{member.name} {description} <span style={{ color: status === 'lent' ? '#3c963c' : '#ca0808' }}>{cost}{moreCurrencies}</span> in total</label>
            </div>
            <div class={styles['balance-owers']}>
              <For each={Object.entries(balance.owes)}>{([owerId, debt]) => {
                const ower = users()[owerId]

                return <For each={Object.entries(debt).filter(([, amount]) => amount !== 0)}>{(debt) => {
                  const [status, description, cost] = relativeStatus(debt)

                  return (
                    <div class={styles['balance-ower']}>
                      <ProfilePicture title={ower.email} picture={ower.picture} />
                      <label>{member.name} {description} <span style={{ color: status === 'lent' ? '#3c963c' : '#ca0808' }}>{cost}</span> {status === 'lent' ? 'from' : 'to'} {ower.name}</label>

                      {wip()[member.id + "_" + ower.id + "_" + debt[0]]
                        ? <span style={{ 'font-style': 'oblique' }}>loading...</span>
                        : <button class={`${appStyles.button} ${styles['settle-up']} `} onClick={() => settleUp(member, ower, Number(debt[0]), debt[1])}>Settle up</button>
                      }
                    </div>
                  )
                }}</For>
              }}</For>
            </div>
          </>
        }}</For>
      }
    </div>
  )
}

function usersMap(group: DetailedGroup): Record<UserId, User> {
  const entries = group.members.map(m => ([m.user.id, m.user] as const))
  return Object.fromEntries(entries)
}
