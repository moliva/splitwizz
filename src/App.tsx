import {
  For,
  createSignal,
  onMount,
  Switch,
  Match,
  Show,
  onCleanup,
  createResource,
  createEffect,
  lazy
} from 'solid-js'
import { useNavigate, useSearchParams, Routes, Route, useLocation } from '@solidjs/router'

import { DetailedGroup, IdToken, Identity, Notification, NotificationAction } from './types'
import {
  fetchCurrencies as doFetchCurrencies,
  fetchNotifications as doFetchNotifications,
  fetchBalances,
  fetchExpenses,
  fetchGroup,
  fetchSync,
  updateMembership,
  updateNotification,
  updateNotifications
} from './services'
import { useAppContext } from './context'

import { Nav } from './components/NavComponent'
import { Login } from './components/Login'
import { NotificationsPanel } from './components/NotificationsPanel'

import styles from './App.module.css'
import { formatError, sleep } from './utils'
import { getCookie, setCookie } from './cookies'

const Home = lazy(() => import('./pages/Home'))
const GroupPage = lazy(() => import('./pages/Group'))

export default () => {
  const [state, { setState, setGroup, setError }] = useAppContext()

  const navigate = useNavigate()

  // FIXME - dupped method from group - moliva - 2024/04/10
  const fetchGroupData = async (id: string, opts: { refetching: boolean; field: string }): Promise<DetailedGroup> => {
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

      let result
      if (opts.field === 'expenses') {
        const expensesFetch = fetchExpenses(identity!, Number(id))
        const balancesFetch = fetchBalances(identity!, Number(id))
        const [expenses, balances] = await Promise.all([expensesFetch, balancesFetch])
        result = {
          ...group,
          expenses,
          balances
        }
      } else {
        const newGroup = await fetchGroup(identity!, Number(id))
        result = {
          ...group,
          ...newGroup
        }
      }

      setGroup(result)

      return result
    } catch (e) {
      setError(formatError('Error while fetching detailed group', e))
      const group = state().groups[id]
      return group as DetailedGroup
    }
  }

  // handle auth
  if (!state().identity) {
    let identity: IdToken | undefined = undefined

    const [searchParams] = useSearchParams()
    let token = searchParams.login_success

    // first check in cookies
    let idToken = getCookie('idToken')

    if (idToken) {
      const decoded = atob(idToken)
      identity = JSON.parse(decoded) as IdToken

      // else check the query params
    } else if (typeof token === 'string') {
      const idToken = token.split('.')[1]

      const decoded = atob(idToken)
      identity = JSON.parse(decoded) as IdToken

      // set cookie once we validate the token
      setCookie('idToken', idToken, 365)
    }

    if (identity) {
      const newIdentityState = { identity }
      const location = useLocation()

      setState({ ...state(), identity: newIdentityState })
      navigate(location.pathname)
    }
  }

  createEffect(async alreadyFetched => {
    if (alreadyFetched) return

    const identity = state().identity

    if (identity) {
      const currencies = await doFetchCurrencies(identity!)
      setState({ ...state(), currencies: Object.fromEntries(currencies.map(c => [c.id, c])) })

      return true
    }

    return false
  }, false)

  async function fetchNotifications() {
    try {
      const identity = state().identity

      if (!identity) {
        // return premaruterly if not logged in yet
        return []
      }

      const result = await doFetchNotifications(identity!)

      return result
    } catch (e) {
      setError(e)
      return []
    }
  }

  const [notifications, { mutate: setNotifications, refetch: refetchNotifications }] =
    createResource(fetchNotifications)

  const [showNotifications, setShowNotifications] = createSignal(false)
  const toggleNotifications = async () => {
    if (!showNotifications()) {
      await updateNotifications({ ids: (notifications() ?? []).map(n => n.id), status: 'read' }, state().identity!)
      const newNotifications = (notifications() ?? []).map(n => ({ ...n, status: 'read' as const }))
      setNotifications(newNotifications)
    }

    setShowNotifications(!showNotifications())
  }

  const handleAppKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      if (showNotifications()) {
        // if notifications modal is currently on, discard it
        setShowNotifications(false)
      }
      return false
    }
  }

  const syncMaster = async () => {
    while (!state().identity) {
      await sleep(1000)
    }

    // long polling on fetch sync and processing events
    while (true) {
      const events = await fetchSync(state().identity!)
      for (const event of events) {
        switch (event.kind) {
          case 'group': {
            await fetchGroupData(`${event.id}`, { refetching: true, field: event.field })
            break
          }
          case 'notification': {
            await refetchNotifications()
            break
          }
          default: {
            console.warn('unknown event', event)
          }
        }
      }
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleAppKeydown, true)
    syncMaster().catch(e => {
      setError(formatError('Error while syncing', e))
    })
  })

  onCleanup(() => {
    window.removeEventListener('keydown', handleAppKeydown)
  })

  const onNotificationAction = async (action: NotificationAction, notification: Notification): Promise<void> => {
    try {
      await updateMembership(action, notification.data.group, state().identity!)
      await updateNotification(notification, { status: 'archived' }, state().identity!)

      if (action === 'joined') {
        const group = notification.data.group
        setGroup(group)
      }

      const ns = [...notifications()!]
      const index = ns.indexOf(notification)
      ns.splice(index, 1)
      setNotifications(ns)
    } catch (e) {
      setError(formatError('Error while creating expense', e))
    }
  }

  const onArchiveNotifications = async (notifications_: Notification[]): Promise<void> => {
    try {
      const ids = notifications_.map(n => n.id)

      await updateNotifications({ ids, status: 'archived' }, state().identity!)

      const ns = notifications()!.filter(n => !notifications_.includes(n))
      setNotifications(ns)
    } catch (e) {
      setError(formatError('Error while creating expense', e))
    }
  }

  return (
    <div class={styles.App}>
      <Show when={state().error !== undefined}>
        <div class={styles['error-float']}>
          <div class={styles['error-toast']}>
            <For each={state().error!.split('\n')}>{errorLine => <label>{errorLine}</label>}</For>
            <button class={styles['error-clear']} onClick={() => setError()}>
              Clear
            </button>
          </div>
        </div>
      </Show>
      <Switch fallback={<Login />}>
        <Match when={typeof state().identity !== 'undefined'}>
          <header class={styles.header}>
            <Nav
              identity={state().identity!}
              onNotificationsClicked={toggleNotifications}
              notifications={notifications}
            />
          </header>
          <main class={styles.main}>
            <Show when={showNotifications()}>
              <NotificationsPanel
                notifications={notifications}
                onClose={toggleNotifications}
                onAction={onNotificationAction}
                onArchive={onArchiveNotifications}
              />
            </Show>
            <section class={styles.content}>
              <Routes>
                <Route path={import.meta.env.BASE_URL}>
                  <Route path='/' component={Home} />
                  <Route path='/groups/:id' component={GroupPage} />
                </Route>
              </Routes>
            </section>
          </main>
        </Match>
      </Switch>
    </div>
  )
}
