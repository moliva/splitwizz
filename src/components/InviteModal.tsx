import appStyles from '../App.module.css'
import editGroupStyles from './EditGroupComponent.module.css'

export type InviteProps = {
  onConfirm(email: string): void
  onDiscard(): void
}

export const InviteModal = (props: InviteProps) => {
  const { onDiscard } = props

  let emailRef

  const onConfirm = () => {
    props.onConfirm(emailRef!.value)
  }

  return <div class={editGroupStyles.modal}>
    <div class={editGroupStyles["modal-content"]}>
      <label class={editGroupStyles["modal-title"]}>Invite users by email</label>
      <input ref={emailRef} placeholder="Email"></input>
      <div class={editGroupStyles['modal-controls']}>
        <button class={`${appStyles.button} ${appStyles.primary}`} onClick={onConfirm}>Invite</button>
        <button class={`${appStyles.button} ${appStyles.secondary}`} onClick={onDiscard}>Cancel</button>
      </div>
    </div>
  </div>
}
