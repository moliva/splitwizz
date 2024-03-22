import { Match, Switch, createEffect, createResource, createSignal } from "solid-js"
import { useParams } from "@solidjs/router"

import { fetchExpenses, fetchGroup, } from "../services"
import { DetailedGroup } from "../types"
import { useAppContext } from "../context"

import { Expenses } from "../components/Expenses"

import styles from './Group.module.css'
import { formatExpenses } from "../utils"

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

  const [group] = createResource(params.id, fetchGroupData);
  const [expenses, setExpenses] = createSignal({})

  const [tab, setTab] = createSignal(0)
  const updateTab = (index: number) => () => setTab(index)

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

  createEffect(() => {
    if (group() && state().groups[group()!.id!].expenses) {
      const expenses = formatExpenses(state(), group()!)

      setExpenses(expenses)
    }
  })

  return (
    <div class={styles.main}>
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
              <Expenses expenses={expenses} group={group} onExpenseCreated={refreshContent} />
            </Match>
            <Match when={tab() === 1}>
              Balances
            </Match>
          </Switch>
        </>
      )}
    </div>
  )
}
