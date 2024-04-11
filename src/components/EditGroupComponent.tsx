import { Accessor, For } from 'solid-js'

import { DetailedGroup, Group } from '../types'
import { useAppContext } from '../context'

import appStyles from '../App.module.css'
import styles from './EditGroupComponent.module.css'
import expenseStyles from './ExpenseModal.module.css'

export type EditGroupProps = {
  group: Accessor<DetailedGroup | undefined>

  onConfirm(note: Group): void
  onDiscard(): void
}

export const EditGroup = (props: EditGroupProps) => {
  const { group } = props

  const [state] = useAppContext()

  let newGroupName
  let simplifiedBalance
  let defaultCurrencyId

  const newGroup = () =>
    ({
      id: group()?.id,
      name: newGroupName!.value,
      default_currency_id: Number(defaultCurrencyId!.value),
      balance_config: {
        simplified: simplifiedBalance!.checked
      }
    }) as Group

  return (
    <div class={styles.modal}>
      <div class={styles['modal-content']}>
        <input ref={newGroupName} class={styles['modal-name']} placeholder='Group name' value={group()?.name ?? ''} />
        <div style={{ display: 'inline-flex', gap: '10px' }}>
          <label>Default currency</label>
          <select
            class={expenseStyles['currency-select']}
            ref={defaultCurrencyId}
            value={group()?.default_currency_id ?? state().currencies[1].id}>
            <For each={Object.values(state().currencies)}>
              {currency => (
                <option value={currency.id} title={currency.description}>
                  {currency.acronym}
                </option>
              )}
            </For>
          </select>
        </div>
        <div style={{ display: 'inline-flex', gap: '10px' }}>
          <label>Simplified balance</label>
          <input
            type='checkbox'
            ref={simplifiedBalance}
            class={styles['modal-name']}
            checked={group()?.balance_config?.simplified ?? false}
          />
        </div>
        <hr class={styles.divider} />
        <div class={styles['modal-controls']}>
          <button class={`${appStyles.button} ${appStyles.primary}`} onClick={() => props.onConfirm(newGroup())}>
            {group() ? 'Edit' : 'Create'}
          </button>
          <button class={`${appStyles.button} ${appStyles.secondary}`} onClick={props.onDiscard}>
            Discard
          </button>
        </div>
      </div>
    </div>
  )
}
