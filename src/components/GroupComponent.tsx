import { A } from '@solidjs/router'

import { Group } from '../types'

import styles from './GroupComponent.module.css'
import appStyles from '../App.module.css'

export type GroupProps = {
  group: Group

  onEdit(group: Group): void
}

export const GroupComponent = (props: GroupProps) => {
  const { group } = props

  return (
    <A href={`${import.meta.env.BASE_URL}groups/${group.id}`} class={appStyles.link}>
      <div class={styles.group}>
        <label>{group.name}</label>
      </div>
    </A>
  )
}
