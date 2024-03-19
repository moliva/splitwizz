import { For } from 'solid-js'

import { Notification, NotificationAction } from '../types'

import styles from '../App.module.css'
import editGroupstyles from './EditGroupComponent.module.css'

export type NotificationsProps = {
  notifications: Notification[]

  onClose: () => void
  onAction: (action: NotificationAction, notification: Notification) => void
}

export const NotificationsPanel = (props: NotificationsProps) => {
  const { notifications } = props

  return <div class={editGroupstyles.modal}>
    <div class={editGroupstyles["modal-content"]}>
      <h2>Notifications</h2>
      <div class={styles['notification-cards']}>
        <For each={notifications}>{(notification) =>
          <div class={styles['notification-card']}>
            <label>You've been invited to group <span style={{
              color: 'green', 'font-style': 'italic'
            }}>{notification.group?.name}</span></label>
            <div class={styles['notification-card-controls']}>
              <button class={`${styles['notification-button']} ${styles.primary}`} onClick={() => props.onAction('joined', notification)}>Accept</button>
              <button class={`${styles['notification-button']} ${styles.cancel}`} onClick={() => props.onAction('rejected', notification)}>Decline</button>
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
