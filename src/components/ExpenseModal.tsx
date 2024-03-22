import { For, createSignal } from 'solid-js'
import { Ref } from '@digichanges/solid-multiselect'

import { User, DetailedGroup, Expense } from '../types'
import { useAppContext } from '../context'

import { UserSelect } from './UserSelect'

import styles from './ExpenseModal.module.css'
import appStyles from '../App.module.css'
import editGroupStyles from './EditGroupComponent.module.css'

export type ExpenseModalProps = {
  group: DetailedGroup

  onConfirm(expense: Expense): void
  onDiscard(): void
}

export const ExpenseModal = (props: ExpenseModalProps) => {
  const [state] = useAppContext()

  const [payerRef, setPayerRef] = createSignal<Ref | undefined>()
  const [splitBetweenRef, setSplitBetweenRef] = createSignal<Ref | undefined>()

  const [isConfirmDisabled, setConfirmDisabled] = createSignal(true)

  const { onDiscard, group } = props

  // TODO - fix types - moliva - 2024/03/21
  let descriptionRef: any, currencyRef, amountRef: any, dateRef: any

  const checkConfirm = () => {
    const newValue = (descriptionRef?.value?.length ?? 0) === 0 ||
      (amountRef?.value ?? '') === '' ||
      (dateRef?.value ?? '') === '' ||
      payerRef()?.values()?.length === 0 ||
      splitBetweenRef()?.values()?.length === 0

    setConfirmDisabled(newValue)
  }

  const onConfirm = () => {
    const expense = {
      description: descriptionRef!.value,
      currency_id: Number(currencyRef!.value),
      amount: Number(amountRef!.value) || 0,
      date: dateRef!.value + '.000Z',
      split_strategy: {
        kind: "equally" as const,
        payer: payerRef()!.values()[0].id,
        split_between: splitBetweenRef()!.values().map((u: User) => u.id),
      }
    }

    props.onConfirm(expense)
  }

  const dateString = new Date().toISOString()
  const date = dateString.substring(0, dateString.indexOf('.'))
  const members = group.members.filter(m => m.status === 'joined')
  const users = members.map(m => m.user)
  const me = members.filter(m => m.user.email === state().identity?.identity.email).map(m => m.user)


  return (
    <div class={editGroupStyles.modal}>
      <div class={editGroupStyles["modal-content"]} style={{ "max-width": "400px" }}>
        <label class={editGroupStyles["modal-title"]}>New expense in <span class={styles['group-name']}>{group.name}</span></label>
        <div style={{ display: 'flex', "align-items": 'center', gap: "5px" }}>
          <input style={{ "flex-grow": 1 }} onChange={checkConfirm} ref={descriptionRef} placeholder="Description"></input>
          <input ref={dateRef} placeholder="Date" onChange={checkConfirm} type="datetime-local" value={date}></input>
        </div>
        <div style={{ display: 'inline-flex', 'margin-bottom': '20px' }}>
          <select class={styles['currency-select']} ref={currencyRef}>
            <For each={Object.values(state().currencies)}>{(currency) => (
              <option value={currency.id} title={currency.description}>{currency.acronym}</option>
            )}</For>
          </select>
          <input style={{ "flex-grow": 1 }} ref={amountRef} onChange={checkConfirm} placeholder="0.00" type="number"></input>
        </div>
        <div style={{ display: "flex", "flex-direction": "column" }}>
          <label class={styles['user-select-label']}>Paid by</label>
          <UserSelect
            onChange={checkConfirm}
            ref={setPayerRef}
            users={users}
            initialSelection={me}
            placeholder="Who's paying"
            closeOnSelect={true}
            selectionLimit={1}
          />
          <label class={styles['user-select-label']} style={{ "margin-top": '10px' }}>Split equally between</label>
          <UserSelect
            onChange={checkConfirm}
            ref={setSplitBetweenRef}
            users={users}
            initialSelection={users}
            placeholder="Who are splitting the bill later"
            closeOnSelect={false}
          />
        </div>
        <div class={editGroupStyles['modal-controls']}>
          <button class={`${appStyles.button} ${appStyles.primary}`} onClick={onConfirm} disabled={isConfirmDisabled()}>Create</button>
          <button class={`${appStyles.button} ${appStyles.secondary}`} onClick={onDiscard}>Discard</button>
        </div>
      </div>
    </div>
  )
}
