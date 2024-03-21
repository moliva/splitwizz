import { For, createEffect, createSignal } from 'solid-js'
import { MultiSelect, Ref } from '@digichanges/solid-multiselect'

import { User, DetailedGroup, Expense } from '../types'
import { useAppContext } from '../context'

import styles from './ExpenseModal.module.css'
import appStyles from '../App.module.css'
import navStyles from './NavComponent.module.css'
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
    // TODO - on change of multiselect not working when dleeting or adding elements - moliva - 2024/03/21
    // on select and on remove do not work with the values field
    console.info(payerRef()?.values())
    console.info(dateRef?.value)
    const newValue = (descriptionRef?.value?.length ?? 0) === 0 ||
      (amountRef?.value ?? '') === '' ||
      (dateRef?.value ?? '') === '' ||
      payerRef()?.values()?.length === 0 ||
      splitBetweenRef()?.values()?.length === 0

    setConfirmDisabled(newValue)

  }

  const onConfirm = () => {
    if (payerRef().values.len === 0) {
      // TODO - this should be validated before confirming - moliva - 2024/03/21
      return
    }

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


  return <div class={editGroupStyles.modal}>
    <div class={editGroupStyles["modal-content"]} style={{ "max-width": "400px" }}>
      <label class={editGroupStyles["modal-title"]}>New expense in <span class={styles['group-name']}>{group.name}</span></label>
      <div style={{ display: 'flex', "align-items": 'center' }}>
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
        <label style={{ "text-wrap": "nowrap", "font-size": "14px" }}>Paid by</label>
        <MultiSelect
          onSelect={checkConfirm}
          onRemove={checkConfirm}
          ref={setPayerRef}
          options={users}
          isObject
          displayValue="email"
          renderValue={(member: User) => <div class={styles['select-user-option']}>
            <img
              class={`${navStyles['profile-picture']} ${styles.tiny}`}
              src={member.picture}
              title={member.email}
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              alt="profile"
            />
            <span>{member.name}</span>
          </div>}
          selectedValues={me}
          selectionLimit={1}
          hidePlaceholder={true}
          placeholder="Who's paying"
          closeOnSelect={true}
          style={{
            optionContainer: { 'background-color': '#282c34' },
            option: { display: 'flex', 'align-items': 'center', 'height': '40px', margin: '0', padding: '0 10px' }
          }}
        />
        <label style={{ "text-wrap": "nowrap", "margin-top": '10px', "font-size": "14px" }}>Split equally between</label>
        <MultiSelect
          onSelect={checkConfirm}
          onRemove={checkConfirm}
          ref={setSplitBetweenRef}
          options={users}
          isObject
          displayValue="email"
          renderValue={(member: User) => <div class={styles['select-user-option']}>
            <img
              class={`${navStyles['profile-picture']} ${styles.tiny}`}
              src={member.picture}
              title={member.email}
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              alt="profile"
            />
            <span>{member.name}</span>
          </div>}
          selectedValues={users}
          hidePlaceholder={true}
          placeholder="Who are splitting the bill later"
          closeOnSelect={false}
          style={{
            optionContainer: { 'background-color': '#282c34' },
            option: { display: 'flex', 'align-items': 'center', 'height': '40px', margin: '0', padding: '0 10px' }
          }}
        />
      </div>
      <div class={editGroupStyles['modal-controls']}>
        <button class={`${appStyles.button} ${appStyles.primary}`} onClick={onConfirm} disabled={isConfirmDisabled()}>Create</button>
        <button class={`${appStyles.button} ${appStyles.secondary}`} onClick={onDiscard}>Discard</button>
      </div>
    </div>
  </div>
}
