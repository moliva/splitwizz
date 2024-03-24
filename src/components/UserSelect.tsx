import { MultiSelect } from '@moliva/solid-multiselect'

import { User } from '../types'

import { ProfilePicture } from './ProfilePicture'

import styles from './ExpenseModal.module.css'

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
    ref={props.ref}
    onSelect={props.onChange}
    onRemove={props.onChange}
    emptyRecordMsg="No more users in the group"
    options={props.users}
    isObject
    displayValue="email"
    renderValue={(member: User) => <div class={styles['select-user-option']}>
      <ProfilePicture title={member.email} picture={member.picture} />
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

