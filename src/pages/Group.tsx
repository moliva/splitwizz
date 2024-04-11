import { Match, Show, Switch, createEffect, createSignal, onMount } from 'solid-js'
import { useParams } from '@solidjs/router'

import { faRotateRight, faSliders, faUsers } from '@fortawesome/free-solid-svg-icons'
import Fa from 'solid-fa'

import { fetchBalances, fetchExpenses, fetchGroup, postGroup, putGroup } from '../services'
import { Balance, DetailedGroup, Group } from '../types'
import { useAppContext } from '../context'
import { formatError, formatExpenses } from '../utils'

import { Balances } from '../components/Balances'
import { Expenses } from '../components/Expenses'
import { EditGroup } from '../components/EditGroupComponent'
import { UsersModal } from '../components/UsersModal'

import styles from './Group.module.css'

export default () => {
  const params = useParams()
  const [state, { setError, setGroup }] = useAppContext()

  const fetchGroupData = async (id: string, opts: { refetching: boolean }): Promise<DetailedGroup> => {
    try {
      const group = state().groups[id]

      // check if we currently have the group loaded with detailed fields as well or force fetch
      if (!opts.refetching && group?.members) {
        return group
      }

      const identity = state().identity

      if (!identity) {
        throw 'not authentified!'
      }

      const result = await fetchGroup(identity!, Number(id))
      setGroup(result)

      return result
    } catch (e) {
      setError(formatError('Error while fetching detailed group', e))
      const group = state().groups[id]
      return group as DetailedGroup
    }
  }

  const [showGroupModal, setShowGroupModal] = createSignal(false)
  const [showUsersModal, setShowUsersModal] = createSignal(false)

  const [group, setGroupSignal] = createSignal<DetailedGroup | undefined>()

  const [expenses, setExpenses] = createSignal({})
  const [balances, setBalances] = createSignal<Balance[]>([])

  const [tab, setTab] = createSignal(0)
  const updateTab = (index: number) => () => setTab(index)

  onMount(() => {
    fetchGroupData(params.id, { refetching: false })
  })

  createEffect(() => {
    setGroupSignal(state().groups[params.id])
  })

  const refreshContent = async () => {
    try {
      const currentIdentity = state().identity!

      const groupId = group()!.id!

      const expensesPromise = currentIdentity ? fetchExpenses(currentIdentity, groupId) : undefined
      const balancesPromise = currentIdentity ? fetchBalances(currentIdentity, groupId) : undefined

      const [expenses, balances] = await Promise.all([expensesPromise, balancesPromise])

      setGroup({
        ...group()!,
        expenses,
        balances
      })
    } catch (e) {
      setError(formatError('Error while refreshing content', e))
      throw e
    }
  }

  let alreadyFetch = false
  createEffect(async () => {
    if (!alreadyFetch) {
      if (group()?.members) {
        alreadyFetch = true
        try {
          await refreshContent()
        } catch (e) {
          // put back to false due to error thrown
          alreadyFetch = false
        }
      }
    }
  })

  const refreshAll = async () => {
    fetchGroupData(params.id, { refetching: true })
    refreshContent()
  }

  createEffect(() => {
    try {
      // TODO - refactor this ensuring we have fetched detailed group, expenses and balances - moliva - 2024/04/11
      if (group() && state().groups[group()!.id!].members && state().groups[group()!.id!].expenses) {
        const expenses = formatExpenses(state(), group()!)

        setExpenses(expenses)
        setBalances(state().groups[group()!.id!].balances)
      }
    } catch (e: any) {
      setError(formatError('Error while formatting and setting new data', e))
    }
  })

  const updateGroup = (updated: Group) => {
    const promise = updated.id ? putGroup(updated, state()!.identity!) : postGroup(updated, state()!.identity!)

    promise
      .then(() => {
        setGroup({ ...group()!, ...updated })
      })
      .catch(e => {
        setError(formatError('Error while updating group', e))
      })

    setShowGroupModal(false)
  }

  return (
    <div class={styles.main}>
      <Show when={showGroupModal()}>
        <EditGroup group={group()!} onDiscard={() => setShowGroupModal(false)} onConfirm={updateGroup} />
      </Show>
      <Show when={showUsersModal()}>
        <UsersModal group={group} onClose={() => setShowUsersModal(false)} />
      </Show>
      {group()?.id ? (
        <>
          <div style={{ display: 'inline-flex', 'margin-bottom': '10px', gap: '8px' }}>
            <label style={{ 'font-weight': '700', 'font-size': 'x-large' }} class={styles.name}>
              {group()!.name}
            </label>
            <button title='Group settings' onClick={() => setShowGroupModal(true)}>
              <Fa class={`${styles['group-icon']} ${styles['group-settings-icon']}`} icon={faSliders} />
            </button>
            <button title='Users' onClick={() => setShowUsersModal(true)}>
              <Fa class={`${styles['group-icon']} ${styles['group-users-icon']}`} icon={faUsers} />
            </button>
            <button title='Refresh group' onClick={() => refreshAll()}>
              <Fa class={`${styles['group-icon']} ${styles['group-refresh-icon']}`} icon={faRotateRight} />
            </button>
          </div>
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
              <Switch fallback={<p>Loading...</p>}>
                <Match when={typeof group()?.expenses === 'object'}>
                  <Expenses
                    expenses={expenses}
                    group={group}
                    onExpenseCreated={refreshContent}
                    onExpenseDeleted={refreshContent}
                  />
                </Match>
              </Switch>
            </Match>
            <Match when={tab() === 1}>
              <Switch fallback={<p>Loading...</p>}>
                <Match when={typeof group()?.balances === 'object'}>
                  <Balances balances={balances} group={group} onPayment={refreshContent} />
                </Match>
              </Switch>
            </Match>
          </Switch>
        </>
      ) : (
        'Loading'
      )}
    </div>
  )
}
