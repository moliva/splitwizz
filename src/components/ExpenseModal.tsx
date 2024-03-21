import { For, createSignal } from 'solid-js'
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

  const { onDiscard, group } = props

  let descriptionRef, currencyRef, amountRef, dateRef

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
    <div class={editGroupStyles["modal-content"]}>
      <label class={editGroupStyles["modal-title"]}>New expense in <span class={appStyles['group-name']}>{group.name}</span></label>
      <input ref={descriptionRef} placeholder="Description"></input>
      <div style={{ display: 'inline-flex', 'margin-bottom': '50px' }}>
        <select ref={currencyRef}>
          <For each={state().currencies}>{(currency) => (
            <option value={currency.id} title={currency.description}>{currency.acronym}</option>
          )}</For>
        </select>
        <input ref={amountRef} placeholder="0.00" type="number"></input>
      </div>
      <input ref={dateRef} placeholder="Date" type="datetime-local" value={date}></input>
      <div style={{ display: "inline-flex", "align-items": "center", gap: "10px" }}>
        <label style={{ "text-wrap": "nowrap" }}>Paid by</label>
        <MultiSelect
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
      </div>
      <div style={{ display: "block" }}>
        <label style={{ "text-wrap": "nowrap", "margin-bottom": '5px' }}>Split equally between</label>
        <MultiSelect
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
        <button class={`${appStyles.button} ${appStyles.primary}`} onClick={onConfirm}>Create</button>
        <button class={`${appStyles.button} ${appStyles.secondary}`} onClick={onDiscard}>Discard</button>
      </div>
    </div>
  </div>
}
