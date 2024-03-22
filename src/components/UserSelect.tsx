import { MultiSelect } from '@digichanges/solid-multiselect'

import { User } from '../types'

import styles from './ExpenseModal.module.css'
import navStyles from './NavComponent.module.css'

export type UserSelectProps = {
  onChange: () => void
  ref: any
  users: User[]
  initialSelection: User[]
  placeholder: string
  closeOnSelect: boolean
  selectionLimit?: number
}

export const UserSelect = (props: UserSelectProps) =>
  <MultiSelect
    onSelect={props.onChange}
    onRemove={props.onChange}
    ref={props.ref}
    emptyRecordMsg="No more users in the group"
    options={props.users}
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
    selectedValues={props.initialSelection}
    selectionLimit={props.selectionLimit}
    hidePlaceholder={true}
    placeholder={props.placeholder}
    closeOnSelect={props.closeOnSelect}
    style={{
      optionContainer: { 'background-color': '#282c34' },
      option: { display: 'flex', 'align-items': 'center', 'height': '40px', margin: '0', padding: '0 10px' }
    }}
  />

