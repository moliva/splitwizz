import { createSignal, For, onMount, Switch, Match, Show, createEffect, onCleanup, createResource, } from 'solid-js'
import { useNavigate, useSearchParams } from "@solidjs/router"

import { IdentityState, Group, Notification } from './types'
import { fetchNotifications as doFetchNotifications, deleteGroup, postGroup, putGroup, fetchGroups } from './services'
import { useAppContext } from './context'

import { GroupComponent } from './components/GroupComponent'
import { EditGroup } from './components/EditGroupComponent'
import { Nav } from './components/NavComponent'
import { Login } from './components/Login'

import styles from './App.module.css'
import editGroupstyles from './components/EditGroupComponent.module.css'

export default () => {
  const [state, setState] = useAppContext()!

  const [identity, setIdentity] = createSignal<IdentityState>(undefined)

  const [groups, setGroups] = createSignal<Group[] | undefined>(undefined)
  const [filter, setFilter] = createSignal("")
  const [filteredGroups, setFilteredGroups] = createSignal<Group[]>([])

  const [showGroupModal, setShowGroupModal] = createSignal(false)
  const [currentGroup, setCurrentGroup] = createSignal<Group | undefined>(undefined)

  const [showNotifications, setShowNotifications] = createSignal(false)
  const toggleNotifications = () => setShowNotifications(!showNotifications())

  const navigate = useNavigate()

  async function fetchNotifications() {
    const [state, setState] = useAppContext()!
    const identity = state().identity

    if (!identity) {
      throw 'not authentified!'
    }

    const result = await doFetchNotifications(identity!)

    return result
  }


  const refreshGroups = async () => {
    const currentIdentity = identity()

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

  onMount(async () => {
    refreshContent()

    window.addEventListener('keydown', handleAppKeydown, true)
  })

  onCleanup(() => {
    window.removeEventListener('keydown', handleAppKeydown)
  })

  // handle auth
  const [searchParams] = useSearchParams()
  const token = searchParams.login_success

  if (!identity() && typeof token === "string") {
    const idToken = token.split(".")[1]
    const decoded = atob(idToken)
    const identity = JSON.parse(decoded)

    const newIdentityState = { identity, token }
    setIdentity(newIdentityState)
    setState({ ...state(), identity: newIdentityState })
    navigate(import.meta.env.BASE_URL)
  }

  const createGroup = (group: Group) => {
    const promise = group.id ? putGroup(group, identity()!) : postGroup(group, identity()!)

    promise
      .then(refreshContent)
      .catch(() => {
        // TODO - show error - moliva - 2023/10/11
      })

    setShowGroupModal(false)
  }

  const [notifications, { mutate, refetch }] = createResource(fetchNotifications);

  // createEffect(async () => {
  //   if (identity()) {
  //     console.log("yeeeeeees")
  //     const newNotifications = await refetch()
  //     mutate(newNotifications!)
  //   }
  // })

  const onDeleteGroup = (note: Group): void => {
    deleteGroup(note, identity()!)
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
        <Match when={typeof identity() !== 'undefined'}>
          <header class={styles.header}>
            <Nav identity={identity()!} filter={filter} onFilterChange={setFilter} onNewGroupClicked={() => showModal(undefined)} onNotificationsClicked={toggleNotifications} notifications={notifications} />
          </header>
          <main class={styles.main}>
            <Show when={showNotifications()}>
              <NotificationsPanel notifications={notifications()!} onClose={toggleNotifications} onAction={(a, n) => console.log(a, n)} />
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

export type NotificationAction = 'accept' | 'decline'

export type NotificationsProps = {
  notifications: Notification[]

  onClose: () => void
  onAction: (action: NotificationAction, notification: Notification) => void
}

export const NotificationsPanel = (props: NotificationsProps) => {
  const { notifications } = props

  return <div class={editGroupstyles.modal}>
    <div class={editGroupstyles["modal-content"]}>
      <div class={styles['notification-cards']}>
        <For each={notifications}>{(notification) =>
          <div class={styles['notification-card']}>
            <label>You've been invited to group <span style={{
              color: 'green', 'font-style': 'italic'
            }}>{notification.group?.name}</span></label>
            <div class={styles['notification-card-controls']}>
              <button class={`${styles['notification-button']} ${styles.primary}`} onClick={() => props.onAction('accept', notification)}>Accept</button>
              <button class={`${styles['notification-button']} ${styles.cancel}`} onClick={() => props.onAction('decline', notification)}>Decline</button>
            </div>
          </div>

          // export type Notification = {
          //   group?: Group
          //   updated_at: string,
          // }
          //
          // export type Group = {
          //   id: number | undefined
          //   name: string
          //   created_at: string | undefined
          // }

        }</For>
      </div>
      <div class={editGroupstyles['modal-controls']}>
        <button class={`${styles.button} ${styles.secondary}`} onClick={props.onClose}>Close</button>
      </div>
    </div>
  </div>
}
