import { For, createSignal, onMount, Switch, Match, Show, onCleanup, } from 'solid-js'

import Fa from 'solid-fa'
import { faPlusSquare } from '@fortawesome/free-solid-svg-icons'

import { Group } from '../types'
import { deleteGroup, postGroup, putGroup, fetchGroups } from '../services'
import { useAppContext } from '../context'

import { Filter } from '../components/FilterComponent'
import { EditGroup } from '../components/EditGroupComponent'
import { GroupComponent } from '../components/GroupComponent'

import styles from './Home.module.css'
import appStyles from '../App.module.css'

export type HomeProps = {

}

export default (props: HomeProps) => {
  const [state, setState] = useAppContext()!
  const [groups, setGroups] = createSignal<Group[] | undefined>(undefined)

  const [filter, setFilter] = createSignal<string>("")

  const [showGroupModal, setShowGroupModal] = createSignal(false)
  const [currentGroup, setCurrentGroup] = createSignal<Group | undefined>(undefined)

  const refreshGroups = async () => {
    const currentIdentity = state().identity!

    const groups = currentIdentity ? await fetchGroups(currentIdentity) : undefined
    // TODO - refresh state of groups - moliva - 2024/03/19
    setGroups(groups)
    setState({
      ...state(),
      groups: {
        ...state().groups,
        
      }
    })
  }

  const refreshContent = async () => {
    return refreshGroups()
  }

  const handleAppKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      if (showGroupModal()) {
        // if edit modal is currently on, discard it
        setShowGroupModal(false)
      } else if (filter().length > 0) {
        // if filter is set, unset it
        setFilter("")

      }
      return false
    }
  }

  const createGroup = (group: Group) => {
    const promise = group.id ? putGroup(group, state()!.identity!) : postGroup(group, state()!.identity!)

    promise
      .then(refreshContent)
      .catch(() => {
        // TODO - show error - moliva - 2023/10/11
      })

    setShowGroupModal(false)
  }

  onMount(() => {
    refreshContent()

    window.addEventListener('keydown', handleAppKeydown, true)
  })

  onCleanup(() => {
    window.removeEventListener('keydown', handleAppKeydown)
  })

  const onDeleteGroup = (group: Group): void => {
    deleteGroup(group, state().identity!)
      .then(refreshContent)
      .catch(() => {
        // TODO - show error - moliva - 2023/10/11
      })
  }

  const showModal = (note: Group | undefined) => {
    setCurrentGroup(note)
    setShowGroupModal(true)
  }

  const onFilterChange = () => {

  }

  const onNewGroupClicked = () => {
    showModal(undefined)
  }

  return <>
    <Show when={showGroupModal()}>
      <EditGroup group={currentGroup()} onDiscard={() => setShowGroupModal(false)} onConfirm={createGroup} />
    </Show>
    <Switch fallback={<p>Loading...</p>}>
      <Match when={typeof groups() === 'object'}>
        <div class={styles['home-content']}>
          <div class={styles['home-controls']}>
            <Filter value={filter} onChange={onFilterChange} />
            <button class={`${appStyles.button} ${appStyles.link} ${appStyles['new-note']}`} onClick={onNewGroupClicked}>
              <Fa class={appStyles['nav-icon']} icon={faPlusSquare} />
            </button>
          </div>
          <div>
            <For each={groups()}>{(group) =>
              <GroupComponent group={group} />
            }</For>
          </div>
        </div>
      </Match>
    </Switch>
  </>
}
