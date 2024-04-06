import { For, createSignal, onMount, Switch, Match, Show, onCleanup, createEffect } from 'solid-js'

import Fa from 'solid-fa'
import { faPlusSquare } from '@fortawesome/free-solid-svg-icons'

import { Group } from '../types'
import { deleteGroup, postGroup, putGroup, fetchGroups } from '../services'
import { useAppContext } from '../context'

import { Filter } from '../components/FilterComponent'
import { EditGroup } from '../components/EditGroupComponent'
import { GroupComponent } from '../components/GroupComponent'

import styles from './Home.module.css'
import navStyles from '../components/NavComponent.module.css'
import appStyles from '../App.module.css'
import groupStyles from '../pages/Group.module.css'

export type HomeProps = {}

export default (props: HomeProps) => {
  const [state, setState] = useAppContext()!

  const [filter, setFilter] = createSignal<string>('')
  const [filteredGroups, setFilteredGroups] = createSignal<Group[]>([])

  const [showGroupModal, setShowGroupModal] = createSignal(false)
  const [currentGroup, setCurrentGroup] = createSignal<Group | undefined>()

  const refreshGroups = async () => {
    const currentIdentity = state().identity!

    const groups = currentIdentity ? await fetchGroups(currentIdentity) : undefined

    const newState = {
      ...state(),
      groups: {
        ...state().groups
      }
    }

    for (const g of groups ?? []) {
      newState.groups[g!.id!] = {
        ...(newState.groups[g!.id!] ?? {}),
        ...g
      }
    }

    setState(newState)
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
        setFilter('')
      }
      return false
    }
  }

  const createGroup = (group: Group) => {
    const promise = group.id ? putGroup(group, state()!.identity!) : postGroup(group, state()!.identity!)

    promise.then(refreshContent).catch(() => {
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

  const onNewGroupClicked = () => {
    showModal(undefined)
  }

  createEffect(() => {
    const lowered = filter().toLowerCase()
    const filtered = (Object.values(state().groups) ?? []).filter(group => group.name.toLowerCase().includes(lowered))

    setFilteredGroups(filtered)
  })

  return (
    <>
      <Show when={showGroupModal()}>
        <EditGroup group={currentGroup()} onDiscard={() => setShowGroupModal(false)} onConfirm={createGroup} />
      </Show>
      <Switch fallback={<p>Loading...</p>}>
        <Match when={typeof state().groups === 'object'}>
          <div class={styles['home-content']}>
            <div class={styles['home-controls']}>
              <Filter value={filter} onChange={setFilter} />
            </div>
            <div class={styles.groups}>
              <For each={filteredGroups()}>{group => <GroupComponent group={group} onEdit={showModal} />}</For>
            </div>
          </div>
          <div class={groupStyles.actions}>
            <button
              title='New group'
              class={`${appStyles.button} ${appStyles.link} ${styles['new-group']}`}
              onClick={onNewGroupClicked}>
              <Fa class={navStyles['nav-icon']} icon={faPlusSquare} />
            </button>
          </div>
        </Match>
      </Switch>
    </>
  )
}
