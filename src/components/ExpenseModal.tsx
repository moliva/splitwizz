import appStyles from '../App.module.css'
import editGroupStyles from './EditGroupComponent.module.css'

export type ExpenseProps = {
  onConfirm(email: string): void
  onDiscard(): void
}

export const ExpenseModal = (props: ExpenseProps) => {
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

// #[derive(Serialize, Deserialize, sqlx::FromRow)]
// pub struct Currency {
//     pub id: i32,
//     pub description: String,
// }
//
// #[derive(Serialize, Deserialize, sqlx::FromRow)]
// pub struct Expense {
//     pub id: i32,
//
//     pub payer: User,
//     // pub group: Group,
//
//     pub description: String, // move to its own type
//     pub currency: Currency,
//     pub amount: f64,
//     pub date: chrono::DateTime<chrono::Utc>,
//     pub split_strategy: String, // change for a struct with the actual split
//
//     pub created_at: chrono::DateTime<chrono::Utc>,
//     pub updated_at: chrono::DateTime<chrono::Utc>,
// }
//
