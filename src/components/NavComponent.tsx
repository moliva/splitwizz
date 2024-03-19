import { Accessor, Resource } from "solid-js"

import { faBell, faCircle, faPlusSquare, faUnlockKeyhole } from "@fortawesome/free-solid-svg-icons"
import Fa from "solid-fa"

import { Identity, Notification } from "../types"

import { Filter } from "./FilterComponent"

import appStyles from '../App.module.css'
import styles from './NavComponent.module.css'

export type NavProps = {
  identity: Identity
  notifications: Resource<Notification[]>

  onNotificationsClicked(): void
}

export const Nav = (props: NavProps) => {
  const { identity } = props

  return <nav class={styles.nav}>
    <div class={styles['profile-card']}>
      <div class={styles['nav-app-controls']}>
      </div>
      <div class={styles['nav-auth-controls']}>
        <div class={styles['nav-auth-actions']}>
          <button class={`${appStyles.button} ${appStyles.link} ${styles.notifications} ${styles['nav-button']}`} onClick={props.onNotificationsClicked}>
            {props.notifications()?.length ?? 0 > 0 ?
              <span style={{ display: 'inline-block', position: 'relative' }}>
                <Fa class={styles['nav-icon']} icon={faBell} />
                <Fa class={`${styles['nav-icon']} ${styles['nav-overlap']}`} icon={faCircle} />
                <Fa class={`${styles['nav-icon']} ${styles['nav-overlap-2']}`} icon={faCircle} />
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
