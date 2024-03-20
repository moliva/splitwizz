import { For } from 'solid-js'

import { DetailedGroup } from '../types'
import { useAppContext } from '../context'

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

  return <div class={editGroupStyles.modal}>
    <div class={editGroupStyles["modal-content"]}>
      <label class={editGroupStyles["modal-title"]}>New expense in <span class={appStyles['group-name']}>{group.name}</span></label>
      <input ref={descriptionRef} placeholder="Description"></input>
      <select ref={payerRef}>
        <For each={group.members.filter(m => m.status == 'joined').map(m => m.user)}>{(member) => (
          <option value={member.id}>{member.email}</option>
          // TODO - look for a way to add a select with images and multiselect (for the split part) - moliva - 2024/03/20
          // <option value={member.id}>
          //   <img
          //     class={`${navStyles['profile-picture']} ${navStyles.tiny}`}
          //     src={member.picture}
          //     title={member.name}
          //     crossOrigin="anonymous"
          //     referrerPolicy="no-referrer"
          //     alt="profile"
          //   />
          //   {member.email}</option>
        )}</For>
      </select>
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
        <button class={`${appStyles.button} ${appStyles.primary}`} onClick={onConfirm}>Invite</button>
        <button class={`${appStyles.button} ${appStyles.secondary}`} onClick={onDiscard}>Cancel</button>
      </div>
    </div>
  </div>
}
