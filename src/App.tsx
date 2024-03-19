import { createSignal, For, onMount, Switch, Match, Show, createEffect, onCleanup, createResource, } from 'solid-js'
import { useNavigate, useSearchParams } from "@solidjs/router"

import { Group, Notification, NotificationAction } from './types'
import { fetchNotifications as doFetchNotifications, deleteGroup, postGroup, putGroup, fetchGroups, updateMembership } from './services'
import { useAppContext } from './context'

import { GroupComponent } from './components/GroupComponent'
import { EditGroup } from './components/EditGroupComponent'
import { Nav } from './components/NavComponent'
import { Login } from './components/Login'
import { NotificationsPanel } from './components/NotificationsPanel'

import styles from './App.module.css'

export default () => {
  const [state, setState] = useAppContext()!

  const [groups, setGroups] = createSignal<Group[] | undefined>(undefined)
  const [filter, setFilter] = createSignal("")
  const [filteredGroups, setFilteredGroups] = createSignal<Group[]>([])

  const [showGroupModal, setShowGroupModal] = createSignal(false)
  const [currentGroup, setCurrentGroup] = createSignal<Group | undefined>(undefined)

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

  const refreshGroups = async () => {
    const currentIdentity = state().identity!

    const groups = currentIdentity ? await fetchGroups(currentIdentity) : undefined
    setGroups(groups)
  }

  const refreshContent = async () => {
    return refreshGroups()
  }

  const handleAppKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      if (showGroupModal()) {
        // if edit modal is currently on, discard it
        setShowGroupModal(false)
      } else if (showNotifications()) {
        // if notifications modal is currently on, discard it
        setShowNotifications(false)
      } else if (filter().length > 0) {
        // if filter is set, unset it
        setFilter("")
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

  const createGroup = (group: Group) => {
    const promise = group.id ? putGroup(group, state()!.identity!) : postGroup(group, state()!.identity!)

    promise
      .then(refreshContent)
      .catch(() => {
        // TODO - show error - moliva - 2023/10/11
      })

    setShowGroupModal(false)
  }

  const [notifications, { mutate, refetch: refetchNotifications }] = createResource(fetchNotifications);

  let notificationsTimer: number

  onMount(async () => {
    refreshContent()
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


  const onDeleteGroup = (group: Group): void => {
    deleteGroup(group, state().identity!)
      .then(refreshContent)
      .catch(() => {
        // TODO - show error - moliva - 2023/10/11
      })
  }

  const onNotificationAction = (action: NotificationAction, notification: Notification): void => {
    updateMembership(action, notification, state().identity!)
      .then(refreshContent)
      .catch(() => {
        // TODO - show error - moliva - 2023/10/11
      })
  }

  const showModal = (note: Group | undefined) => {
    setCurrentGroup(note)
    setShowGroupModal(true)
  }

  createEffect(() => {
    const lowered = filter().toLowerCase()
    const filtered = (groups() ?? []).filter(group => group.name.toLowerCase().includes(lowered))

    setFilteredGroups(filtered)
  })

  return (
    <div class={styles.App}>
      <Switch fallback={<Login />}>
        <Match when={typeof state().identity !== 'undefined'}>
          <header class={styles.header}>
            <Nav identity={state().identity!} filter={filter} onFilterChange={setFilter} onNewGroupClicked={() => showModal(undefined)} onNotificationsClicked={toggleNotifications} notifications={notifications} />
          </header>
          <main class={styles.main}>
            <Show when={showNotifications()}>
              <NotificationsPanel notifications={notifications()!} onClose={toggleNotifications} onAction={onNotificationAction} />
            </Show>
            <Show when={showGroupModal()}>
              <EditGroup group={currentGroup()} onDiscard={() => setShowGroupModal(false)} onConfirm={createGroup} />
            </Show>
            <section class={styles.content}>
              <Switch fallback={<p>Loading...</p>}>
                <Match when={typeof groups() === 'object'}>
                  <div style={{ display: 'flex', "flex-direction": "column" }}>
                    <For each={filteredGroups()}>{(group) =>
                      <GroupComponent group={group} />
                    }</For>
                  </div>
                </Match>
              </Switch>
            </section>
          </main>
        </Match>
      </Switch>
    </div >
  )
}
