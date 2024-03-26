import { createEffect, lazy } from 'solid-js'
import { Routes, Route } from "@solidjs/router"
import { createSignal, onMount, Switch, Match, Show, onCleanup, createResource, } from 'solid-js'
import { useNavigate, useSearchParams } from "@solidjs/router"

import { Notification, NotificationAction } from './types'
import { fetchCurrencies as doFetchCurrencies, fetchNotifications as doFetchNotifications, updateMembership, updateNotification, updateNotifications } from './services'
import { useAppContext } from './context'

import { Nav } from './components/NavComponent'
import { Login } from './components/Login'
import { NotificationsPanel } from './components/NotificationsPanel'

import styles from './App.module.css'

const Home = lazy(() => import("./pages/Home"))
const GroupPage = lazy(() => import("./pages/Group"))

export default () => {
  const [state, setState] = useAppContext()

  const navigate = useNavigate()

  async function fetchNotifications() {
    const identity = state().identity

    if (!identity) {
      throw 'not authentified!'
    }

    const result = await doFetchNotifications(identity!)

    return result
  }

  // handle auth
  const [searchParams] = useSearchParams()
  const token = searchParams.login_success

  if (!state().identity && typeof token === "string") {
    const idToken = token.split(".")[1]
    const decoded = atob(idToken)
    const identity = JSON.parse(decoded)

    const newIdentityState = { identity, token }

    setState({ ...state(), identity: newIdentityState })
    navigate(import.meta.env.BASE_URL)
  }

  createEffect(async (alreadyFetched) => {
    if (alreadyFetched) return

    const identity = state().identity

    if (identity) {

      const currencies = await doFetchCurrencies(identity!)
      setState({ ...state(), currencies: Object.fromEntries(currencies.map(c => [c.id, c])) })

      return true
    }

    return false

  }, false)

  const [notifications, { mutate: setNotifications, refetch: refetchNotifications }] = createResource(fetchNotifications);

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

  let notificationsTimer: number

  onMount(() => {

    notificationsTimer = setInterval(() => {
      refetchNotifications()
    }, 10000)

    window.addEventListener('keydown', handleAppKeydown, true)
  })

  onCleanup(() => {
    window.removeEventListener('keydown', handleAppKeydown)
    if (notificationsTimer) {
      clearInterval(notificationsTimer)
    }
  })

  const onNotificationAction = async (action: NotificationAction, notification: Notification): Promise<void> => {
    try {
      await updateMembership(action, notification.data.group, state().identity!)
      await updateNotification(notification, { status: 'archived' }, state().identity!)

      if (action === 'joined') {
        const group = notification.data.group
        const currentState = state()

        const newState = {
          ...currentState,
          groups: {
            ...currentState.groups,
            [group.id!]: {
              // ...currentState.groups[group.id!], // write new instead of merge
              ...group
            }
          }
        }

        setState(newState)
      }

      const ns = [...notifications()!]
      const index = ns.indexOf(notification)
      ns.splice(index, 1)
      setNotifications(ns)
    } catch {
      // TODO - show error - moliva - 2023/10/11
    }
  }

  const onArchiveNotifications = async (notifications_: Notification[]): Promise<void> => {
    try {
      const ids = notifications_.map(n => n.id)

      await updateNotifications({ ids, status: 'archived' }, state().identity!)

      const ns = notifications()!.filter(n => !notifications_.includes(n))
      setNotifications(ns)
    } catch {
      // TODO - show error - moliva - 2023/10/11
    }
  }

  return (
    <div class={styles.App}>
      <Switch fallback={<Login />}>
        <Match when={typeof state().identity !== 'undefined'}>
          <header class={styles.header}>
            <Nav identity={state().identity!} onNotificationsClicked={toggleNotifications} notifications={notifications} />
          </header>
          <main class={styles.main}>
            <Show when={showNotifications()}>
              <NotificationsPanel notifications={notifications} onClose={toggleNotifications} onAction={onNotificationAction} onArchive={onArchiveNotifications} />
            </Show>
            <section class={styles.content}>
              <Routes>
                <Route path={import.meta.env.BASE_URL}>
                  <Route path="/" component={Home} />
                  <Route path="/groups/:id" component={GroupPage} />
                </Route>
              </Routes>
            </section>
          </main>
        </Match>
      </Switch>
    </div>
  )
}
