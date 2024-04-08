import { For, createSignal, Resource, Match, Switch } from 'solid-js'
import { A } from '@solidjs/router'

import { CurrencyId, Notification, NotificationAction } from '../types'
import { useAppContext } from '../context'

import styles from '../App.module.css'
import groupStyles from '../pages/Group.module.css'
import editGroupstyles from './EditGroupComponent.module.css'
import { userName } from '../utils'

export type NotificationsProps = {
  notifications: Resource<Notification[]>

  onClose: () => void
  onAction: (action: NotificationAction, notification: Notification) => Promise<void>
  onArchive: (notifications: Notification[]) => Promise<void>
}

export const NotificationsPanel = (props: NotificationsProps) => {
  const { notifications } = props
  const [state] = useAppContext()

  const [wip, setWip] = createSignal(Object.fromEntries(notifications()!.map((n: Notification) => [n.id, false])))

  const onAction = (action: NotificationAction, notification: Notification) => async () => {
    setWip({ ...wip(), [notification.id!]: true })

    await props.onAction(action, notification)
    setWip({ ...wip(), [notification.id!]: false })
  }

  const archiveNotifications = async (notifications: Notification[]) => {
    await props.onArchive(notifications)
  }

  const onArchiveAll = () => {
    props.onClose()
    props.onArchive(notifications()!)
  }

  function formatPrice(currencyId: CurrencyId, amount: number): string {
    const currency = state().currencies[currencyId].acronym
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency })
    return formatter.format(amount)
  }

  return (
    <div class={editGroupstyles.modal}>
      <div class={editGroupstyles['modal-content']}>
        <h2>Notifications</h2>
        <div class={styles['notification-cards']}>
          <Switch
            fallback={
              <div class={groupStyles['settled-up-container']}>
                <label class={groupStyles['settled-up']} style={{ 'font-size': '20px', 'margin-bottom': '15px' }}>
                  All settled! 🪄
                </label>
              </div>
            }>
            <Match when={(notifications() ?? []).length > 0}>
              <For each={notifications()}>
                {notification => (
                  <div class={styles['notification-card']}>
                    {notification.data.kind === 'invite' ? (
                      <>
                        <label>
                          You've been invited to group{' '}
                          <span class={styles['group-name']}>{notification.data.group.name}</span>
                        </label>
                        <div class={styles['notification-card-controls']}>
                          {wip()[notification.id!] ? (
                            <span style={{ 'font-style': 'oblique' }}>loading...</span>
                          ) : (
                            <>
                              <button
                                class={`${styles['notification-button']} ${styles.primary}`}
                                onClick={onAction('joined', notification)}>
                                Accept
                              </button>
                              <button
                                class={`${styles['notification-button']} ${styles.cancel}`}
                                onClick={onAction('rejected', notification)}>
                                Decline
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <label>
                          {userName(notification.data.created_by)} registered a payment of{' '}
                          <span style={{ color: 'green' }}>
                            {formatPrice(notification.data.currency_id, notification.data.amount)}
                          </span>{' '}
                          {notification.data.payer.email === state().identity!.identity.email ? 'from' : 'to'} you in
                          group{' '}
                          <A
                            href={`${import.meta.env.BASE_URL}groups/${notification.data.group.id}`}
                            class={styles['group-name']}>
                            {notification.data.group.name}
                          </A>
                        </label>
                      </>
                    )}
                    <span
                      title='Archive notification'
                      class={styles['archive-notification']}
                      onClick={() => archiveNotifications([notification])}>
                      ⨯
                    </span>
                  </div>
                )}
              </For>
            </Match>
          </Switch>
        </div>
        <div class={editGroupstyles['modal-controls']}>
          <button
            class={`${styles.button} ${styles.delete}`}
            onClick={onArchiveAll}
            disabled={(notifications() ?? []).length === 0}>
            Archive all
          </button>
          <button class={`${styles.button} ${styles.secondary}`} onClick={props.onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
