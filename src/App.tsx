import { lazy } from 'solid-js'
import { Routes, Route } from "@solidjs/router"
import { createSignal, onMount, Switch, Match, Show, onCleanup, createResource, } from 'solid-js'
import { useNavigate, useSearchParams } from "@solidjs/router"

import { Notification, NotificationAction } from './types'
import { fetchNotifications as doFetchNotifications, updateMembership } from './services'
import { useAppContext } from './context'

import { Nav } from './components/NavComponent'
import { Login } from './components/Login'
import { NotificationsPanel } from './components/NotificationsPanel'

import styles from './App.module.css'

const Home = lazy(() => import("./pages/Home"))
const GroupPage = lazy(() => import("./pages/Group"))

export default () => {
  const [state, setState] = useAppContext()!

  const [showNotifications, setShowNotifications] = createSignal(false)
  const toggleNotifications = () => setShowNotifications(!showNotifications())

  const navigate = useNavigate()

  async function fetchNotifications() {
    const identity = state().identity

    if (!identity) {
      throw 'not authentified!'
    }

    const result = await doFetchNotifications(identity!)

    return result
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

  const [notifications, { refetch: refetchNotifications }] = createResource(fetchNotifications);

  let notificationsTimer: number

  onMount(() => {

    notificationsTimer = setInterval(() => {
      refetchNotifications()
    }, 3000)

    window.addEventListener('keydown', handleAppKeydown, true)
  })

  onCleanup(() => {
    window.removeEventListener('keydown', handleAppKeydown)
    if (notificationsTimer) {
      clearInterval(notificationsTimer)
    }
  })

  const onNotificationAction = (action: NotificationAction, notification: Notification): void => {
    updateMembership(action, notification, state().identity!)
      .then(() => {
        if (action === 'joined') {
          const group = notification.group!
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
      })
      .catch(() => {
        // TODO - show error - moliva - 2023/10/11
      })
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
              <NotificationsPanel notifications={notifications()!} onClose={toggleNotifications} onAction={onNotificationAction} />
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
