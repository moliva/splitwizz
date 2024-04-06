import { DetailedGroup } from '../types'

import { UserSelect } from './UserSelect'

import appStyles from '../App.module.css'
import modalStyles from '../components/EditGroupComponent.module.css'

export type UsersModalProps = {
  group: DetailedGroup

  onClose(): void
}

export const UsersModal = (props: UsersModalProps) => {
  const { group } = props

  const joined = group.members.filter(m => m.status === 'joined').map(m => m.user)
  const pending = group.members.filter(m => m.status === 'pending').map(m => m.user)

  return (
    <div class={modalStyles.modal}>
      <div class={modalStyles['modal-content']}>
        <div>
          <label style={{ 'font-weight': 600 }}>Joined</label>
          <UserSelect users={joined} initialSelection={joined} placeholder='No one here yet!' disable={true} />
        </div>
        <div>
          <label style={{ 'font-weight': 600 }}>Pending</label>
          <UserSelect users={pending} initialSelection={pending} placeholder='No one here yet!' disable={true} />
        </div>
        <hr class={modalStyles.divider} />
        <div class={modalStyles['modal-controls']}>
          <button class={`${appStyles.button} ${appStyles.secondary}`} onClick={props.onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
