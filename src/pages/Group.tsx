import { useParams } from "@solidjs/router"
import { Show, createResource, createSignal } from "solid-js"

import { fetchGroup, inviteUsers as doInviteUsers } from "../services"
import { Group } from "../types"
import { useAppContext } from "../context"

import { InviteModal } from "../components/InviteModal"

import appStyles from '../App.module.css'
import styles from './Group.module.css'

async function fetchGroupData(id: string): Promise<Group> {
  const [state, setState] = useAppContext()!
  const group = state().groups[id]
  if (group) {
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

  const onInviteConfirm = (email: string) => {
    setShowInviteModal(false)

    const identity = state().identity

    if (!identity) {
      throw 'not authentified!'
    }

    doInviteUsers(identity!, group()!.id!, [email])
  }

  return <div class={styles.center}>

    <Show when={showInviteModal()}>
      <InviteModal onConfirm={onInviteConfirm} onDiscard={() => setShowInviteModal(false)} />
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
          </div>
        </>
      )}
    </div>
  </div >
}
