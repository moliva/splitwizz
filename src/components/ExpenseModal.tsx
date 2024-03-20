import { For } from 'solid-js'
import { MultiSelect } from '@digichanges/solid-multiselect'

import { User, DetailedGroup } from '../types'
import { useAppContext } from '../context'

import styles from './ExpenseModal.module.css'
import appStyles from '../App.module.css'
import navStyles from './NavComponent.module.css'
import editGroupStyles from './EditGroupComponent.module.css'

export type ExpenseProps = {
  group: DetailedGroup

  onConfirm(email: string): void
  onDiscard(): void
}

export const ExpenseModal = (props: ExpenseProps) => {
  const [state] = useAppContext()

  const { onDiscard, group } = props

  let descriptionRef, payerRef, currencyRef, amountRef, dateRef, splitStrategyRef

  const onConfirm = () => {
    props.onConfirm(descriptionRef!.value)
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
      <MultiSelect
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
      <div style={{ display: 'inline-flex' }}>
        <select ref={currencyRef}>
          <For each={state().currencies}>{(currency) => (
            <option value={currency.id} title={currency.description}>{currency.acronym}</option>
          )}</For>
        </select>
        <input ref={amountRef} placeholder="0.00" type="number"></input>
      </div>
      <input ref={dateRef} placeholder="Date" type="datetime-local" value={date}></input>
      <input ref={splitStrategyRef} placeholder="Split by"></input>
      <div class={editGroupStyles['modal-controls']}>
        <button class={`${appStyles.button} ${appStyles.primary}`} onClick={onConfirm}>Create</button>
        <button class={`${appStyles.button} ${appStyles.secondary}`} onClick={onDiscard}>Discard</button>
      </div>
    </div>
  </div>
}
