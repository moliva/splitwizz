import { createSignal, onMount } from 'solid-js'
import { A } from '@solidjs/router'

import Fa from 'solid-fa'
import { faPenToSquare, faXmark, faClipboard, faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons'

import { deepCopy } from "deep-copy-ts"

import { Group } from '../types'
import { copyToClipboard } from '../utils'

import styles from './GroupComponent.module.css'
import appStyles from '../App.module.css'


export type GroupProps = {
  group: Group

  // onDelete(group: Group): void
  // onEdit(group: Group): void
  // onModified(group: Group): void
}

export const GroupComponent = (props: GroupProps) => {
  const { group } = props

  return <A href={`${import.meta.env.BASE_URL}groups/${group.id}`} class={appStyles.link}>
    <div class={styles.group}>
      <label>{group.name}</label>

    </div>

  </A>
}

