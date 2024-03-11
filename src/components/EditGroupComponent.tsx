import { Group } from "../types"

import appStyles from '../App.module.css'
import styles from './EditGroupComponent.module.css'

export type EditGroupProps = {
  group: Group | undefined

  onConfirm(note: Group): void
  onDiscard(): void
}

export const EditGroup = (props: EditGroupProps) => {
  const { group } = props

  let newGroupName

  const newGroup = () => ({
    id: group?.id,
    name: newGroupName!.value,
  } as Group)

  return <div class={styles.modal}>
    <div class={styles["modal-content"]}>
      <input ref={newGroupName} class={styles['modal-name']} placeholder="Note name" value={group?.name ?? ''}></input>
      <div class={styles['modal-controls']}>
        <button class={`${appStyles.button} ${appStyles.primary}`} onClick={() => props.onConfirm(newGroup())}>{group ? 'Edit' : 'Create'}</button>
        <button class={`${appStyles.button} ${appStyles.secondary}`} onClick={props.onDiscard}>Discard</button>
      </div>
    </div>
  </div>
}
