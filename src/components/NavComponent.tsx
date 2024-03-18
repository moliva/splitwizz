import { Accessor, Show, createResource, createSignal } from "solid-js"

import { faBell, faCircle, faPlusSquare, faUnlockKeyhole } from "@fortawesome/free-solid-svg-icons"
import Fa from "solid-fa"

import { Identity } from "../types"
import { useAppContext } from "../context"
import { fetchNotifications as doFetchNotifications } from "../services"

import { Filter } from "./FilterComponent"

import appStyles from '../App.module.css'
import styles from './NavComponent.module.css'

export type NavProps = {
  identity: Identity
  filter: Accessor<string>

  onFilterChange(filter: string): void
  onNewGroupClicked(): void
}

async function fetchNotifications() {
  const [state, setState] = useAppContext()!
  const identity = state().identity

  if (!identity) {
    throw 'not authentified!'
  }

  const result = await doFetchNotifications(identity!)

  return result
}

export const Nav = (props: NavProps) => {
  const { identity, filter, onFilterChange, onNewGroupClicked } = props

  const [notifications, { mutate, refetch }] = createResource(fetchNotifications);

  const [showNotifications, setShowNotifications] = createSignal(false)

  const toggleNotifications = () => setShowNotifications(!showNotifications())

  return <nav class={styles.nav}>
    <Show when={showNotifications()}>
      <label>notifications {JSON.stringify(notifications())}</label>
    </Show>
    <div class={styles['profile-card']}>
      <div class={styles['nav-app-controls']}>
        <Filter value={filter} onChange={onFilterChange} />
        <button class={`${appStyles.button} ${appStyles.link} ${styles['new-note']}`} onClick={onNewGroupClicked}>
          <Fa class={styles['nav-icon']} icon={faPlusSquare} />
        </button>
      </div>
      <div class={styles['nav-auth-controls']}>
        <div class={styles['nav-auth-actions']}>
          <button class={`${appStyles.button} ${appStyles.link} ${styles.notifications} ${styles['nav-button']}`} onClick={toggleNotifications}>
            {notifications()?.length ?? 0 > 0 ?
              <span style={{ display: 'inline-block', position: 'relative' }}>
                <Fa class={styles['nav-icon']} icon={faBell} />
                <Fa class={`${styles['nav-icon']} ${styles['nav-overlap']}`} icon={faCircle}
                />
              </span>
              : <Fa class={styles['nav-icon']} icon={faBell} />}
          </button>
          <a class={`${styles['nav-button']} ${appStyles.button} ${appStyles.link} ${styles.logout}`} href={import.meta.env.BASE_URL} >
            <Fa class={styles['nav-icon']} icon={faUnlockKeyhole} />
          </a>
        </div>
        <img
          class={`${styles['profile-picture']} ${styles.tiny}`}
          src={identity.identity.picture}
          title={identity.identity.name}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          alt="profile"
        />
      </div>
    </div>
  </nav>

}

