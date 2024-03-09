import { Accessor } from "solid-js"

import { faPlusSquare, faUnlockKeyhole } from "@fortawesome/free-solid-svg-icons"
import Fa from "solid-fa"

import { Identity } from "../types"

import { Filter } from "./FilterComponent"

import appStyles from '../App.module.css'
import styles from './NavComponent.module.css'

export type NavProps = {
  identity: Identity
  filter: Accessor<string>

  onFilterChange(filter: string): void
  onNewNoteClicked(): void
}

export const Nav = (props: NavProps) => {
  const { identity, filter, onFilterChange, onNewNoteClicked } = props

  return <nav class={styles.nav}>
    <div class={styles['profile-card']}>
      <div class={styles['nav-app-controls']}>
        <Filter value={filter} onChange={onFilterChange} />
        <button class={`${appStyles.button} ${appStyles.link} ${styles['new-note']}`} onClick={onNewNoteClicked}><Fa class={styles['nav-icon']} icon={faPlusSquare} /></button>
      </div>
      <div class={styles['nav-auth-controls']}>
        <a class={`${appStyles.button} ${appStyles.link} ${styles['logout']}`} href={import.meta.env.BASE_URL} ><Fa class={styles['nav-icon']} icon={faUnlockKeyhole} /></a>
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

