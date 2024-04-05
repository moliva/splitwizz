import { For, Match, Show, Switch, createEffect, createResource, createSignal } from 'solid-js'
import { useParams } from '@solidjs/router'

import { fetchBalances, fetchExpenses, fetchGroup } from '../services'
import { Balance, DetailedGroup } from '../types'
import { useAppContext } from '../context'
import { formatExpenses } from '../utils'

import { Balances } from '../components/Balances'
import { Expenses } from '../components/Expenses'

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
  const [state, setState] = useAppContext()!

  const [group] = createResource(params.id, fetchGroupData)

  const [expenses, setExpenses] = createSignal({})
  const [balances, setBalances] = createSignal<Balance[]>([])

  const [tab, setTab] = createSignal(0)
  const updateTab = (index: number) => () => setTab(index)
  const [error, setError] = createSignal<string | undefined>()

  const refreshContent = async () => {
    try {
      const currentIdentity = state().identity!

      const groupId = group()!.id!
      const expenses = currentIdentity ? await fetchExpenses(currentIdentity, groupId) : undefined
      const balances = currentIdentity ? await fetchBalances(currentIdentity, groupId) : undefined

      const newState = {
        ...state(),
        groups: {
          ...state().groups,
          [groupId]: {
            ...group()!,
            expenses,
            balances
          }
        }
      }

      setState(newState)
    } catch (e) {
      setError('Error while refreshing content\n\n' + JSON.stringify(e))
    }
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

  createEffect(() => {
    try {
      if (group() && state().groups[group()!.id!].expenses) {
        const expenses = formatExpenses(state(), group()!)

        setExpenses(expenses)
        setBalances(state().groups[group()!.id!].balances)
      }
    } catch (e: any) {
      setError('Error while formating and setting new data\n\n' + e.toString() + '\n\n' + e.stack)
    }
  })

  return (
    <div class={styles.main}>
      <Show when={error() !== undefined}>
        <div
          style={{
            padding: '3px',
            'background-color': '#ca0808',
            color: 'white',
            display: 'flex',
            'flex-direction': 'column'
          }}>
          <For each={error()!.split('\n')}>{errorLine => <label>{errorLine}</label>}</For>
        </div>
      </Show>
      {group.loading && <div>Loading!</div>}
      {group.error && <div>Error!</div>}
      {group() && (
        <>
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
              <Expenses expenses={expenses} group={group} onExpenseCreated={refreshContent} onExpenseDeleted={refreshContent} />
            </Match>
            <Match when={tab() === 1}>
              <Balances balances={balances} group={group} onPayment={refreshContent} />
            </Match>
          </Switch>
        </>
      )}
    </div>
  )
}
