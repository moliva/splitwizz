import { useParams } from "@solidjs/router"
import { Show, createResource, createSignal } from "solid-js"

import { fetchGroup, inviteUsers as doInviteUsers } from "../services"
import { DetailedGroup, Expense } from "../types"
import { useAppContext } from "../context"

import { InviteModal } from "../components/InviteModal"
import { ExpenseModal } from "../components/ExpenseModal"

import appStyles from '../App.module.css'
import styles from './Group.module.css'

async function fetchGroupData(id: string): Promise<DetailedGroup> {
  const [state, setState] = useAppContext()!

  const group = state().groups[id]

  // check if we currently have the group loaded with detailed fields as well or force fetch
  if (group?.members) {
    return group
  }

  const identity = state().identity

  if (!identity) {
    throw 'not authentified!'
  }

  const result = await fetchGroup(identity!, Number(id))
  setState({ ...state(), groups: { ...state().groups, [id]: result } })

  return result
}

export default () => {
  const params = useParams()

  const [group] = createResource(params.id, fetchGroupData);

  const [state] = useAppContext()!

  const [showInviteModal, setShowInviteModal] = createSignal(false)
  const [showExpenseModal, setShowExpenseModal] = createSignal(false)
  const [currentExpense, setCurrentExpense] = createSignal<string | undefined>() // this will use a `Expense` type

  const onInviteConfirm = (email: string) => {
    setShowInviteModal(false)

    const identity = state().identity

    if (!identity) {
      throw 'not authentified!'
    }

    doInviteUsers(identity!, group()!.id!, [email])
  }

  const onExpenseConfirm = (expense: Expense) => {
    // closeExpenseModal()
    console.info(expense)

  }

  const closeExpenseModal = () => {
    setShowExpenseModal(false)
    setCurrentExpense(undefined)
  }

  return <div class={styles.center}>

    <Show when={showInviteModal()}>
      <InviteModal onConfirm={onInviteConfirm} onDiscard={() => setShowInviteModal(false)} />
    </Show>
    <Show when={showExpenseModal()}>
      <ExpenseModal group={group()!} onConfirm={onExpenseConfirm} onDiscard={closeExpenseModal} />
    </Show>
    <div class={styles.group}>
      {group.loading && <div>Loading!</div>}
      {group.error && <div>Error!</div>}
      {group() && (
        <>
          <div class={styles.main}>
            <h1 class={styles.name}>
              {group()!.name}
            </h1>
          </div>
          <div class={styles.actions}>
            <button class={`${appStyles.button} ${styles.invite}`} onClick={() => setShowInviteModal(true)}>Invite</button>
            <button class={`${appStyles.button} ${styles.expense}`} onClick={() => setShowExpenseModal(true)}>Expense</button>
          </div>
        </>
      )}
    </div>
  </div >
}
