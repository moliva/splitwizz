import { Resource } from "solid-js"
import { A, useLocation, useNavigate } from "@solidjs/router"

import { faBell, faCircle, faUnlockKeyhole, faAngleLeft } from "@fortawesome/free-solid-svg-icons"
import Fa from "solid-fa"

import { Identity, Notification } from "../types"

import { ProfilePicture } from "./ProfilePicture"

import appStyles from '../App.module.css'
import styles from './NavComponent.module.css'

export type NavProps = {
  identity: Identity
  notifications: Resource<Notification[]>

  onNotificationsClicked(): void
}

export const Nav = (props: NavProps) => {
  const { identity } = props

  const navigate = useNavigate()
  const location = useLocation()

  const goBack = () => {
    if (location.pathname === import.meta.env.BASE_URL) {
      navigate(-1)
    } else {
      navigate(import.meta.env.BASE_URL)
    }
  }

  return <nav class={styles.nav}>
    <div class={styles['nav-left-controls']}>
      <button title="Go back" class={`${styles['nav-button']} ${appStyles.button} ${appStyles.link} ${styles.back}`} onClick={goBack} >
        <Fa class={styles['nav-icon']} icon={faAngleLeft} />
      </button>
    </div>
    <div class={styles['profile-card']}>
      <div class={styles['nav-app-controls']}>
      </div>
      <div class={styles['nav-auth-controls']}>
        <div class={styles['nav-auth-actions']}>
          <button title="Notifications" class={`${appStyles.button} ${appStyles.link} ${styles.notifications} ${styles['nav-button']}`} onClick={props.onNotificationsClicked}>
            {props.notifications()?.filter(n => n.status === 'new').length ?? 0 > 0 ?
              <span style={{ display: 'inline-block', position: 'relative' }}>
                <Fa class={styles['nav-icon']} icon={faBell} />
                <Fa class={`${styles['nav-icon']} ${styles['nav-overlap']}`} icon={faCircle} />
                <Fa class={`${styles['nav-icon']} ${styles['nav-overlap-2']}`} icon={faCircle} />
              </span>
              : <Fa class={styles['nav-icon']} icon={faBell} />}
          </button>
          <A title="Log out" class={`${styles['nav-button']} ${appStyles.button} ${appStyles.link} ${styles.logout}`} href={import.meta.env.BASE_URL} >
            <Fa class={styles['nav-icon']} icon={faUnlockKeyhole} />
          </A>
        </div>
        <ProfilePicture title={identity.identity.name} picture={identity.identity.picture} />
      </div>
    </div>
  </nav>
}
