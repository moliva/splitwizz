import { createSignal, For, type Component, onMount, Switch, Match, Show, createEffect, onCleanup } from 'solid-js'
import { useNavigate, useSearchParams } from "@solidjs/router"

import { IdentityState, Group } from './types'
import { deleteGroup, postGroup, putGroup, fetchGroups } from './services'

import { EditGroup } from './components/EditGroupComponent'
import { Nav } from './components/NavComponent'
import { Login } from './components/Login'

import styles from './App.module.css'

export const App: Component = () => {
  const [identity, setIdentity] = createSignal<IdentityState>(undefined)

  const [groups, setGroups] = createSignal<Group[] | undefined>(undefined)
  const [filter, setFilter] = createSignal("")
  const [filteredGroups, setFilteredGroups] = createSignal<Group[]>([])

  const [showGroupModal, setShowGroupModal] = createSignal(false)
  const [currentGroup, setCurrentGroup] = createSignal<Group | undefined>(undefined)

  const navigate = useNavigate()

  const refreshGroups = async () => {
    const currentIdentity = identity()

    const groups = currentIdentity ? await fetchGroups(currentIdentity) : undefined
    setGroups(groups)
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


  onMount(async () => {
    refreshContent()

    window.addEventListener('keydown', handleAppKeydown, true)
  })

  // handle auth
  const [searchParams] = useSearchParams()
  const token = searchParams.login_success

  if (!identity() && typeof token === "string") {
    const idToken = token.split(".")[1]
    const decoded = atob(idToken)
    const identity = JSON.parse(decoded)

    setIdentity({ identity, token })
    navigate(import.meta.env.BASE_URL)
  }

  const createGroup = (group: Group) => {
    const promise = group.id ? putGroup(group, identity()!) : postGroup(group, identity()!)

    promise
      .then(refreshContent)
      .catch(() => {
        // TODO - show error - moliva - 2023/10/11
      })

    setShowGroupModal(false)
  }

  const onDeleteGroup = (note: Group): void => {
    deleteGroup(note, identity()!)
      .then(refreshContent)
      .catch(() => {
        // TODO - show error - moliva - 2023/10/11
      })
  }

  const showModal = (note: Group | undefined) => {
    setCurrentGroup(note)
    setShowGroupModal(true)
  }

  createEffect(() => {
    const lowered = filter().toLowerCase()
    const filtered = (groups() ?? []).filter(group => group.name.toLowerCase().includes(lowered))

    setFilteredGroups(filtered)
  })

  return (
    <div class={styles.App}>
      <Switch fallback={<Login />}>
        <Match when={typeof identity() !== 'undefined'}>
          <header class={styles.header}>
            <Nav identity={identity()!} filter={filter} onFilterChange={setFilter} onNewNoteClicked={() => showModal(undefined)} />
          </header>
          <main class={styles.main}>
            <Show when={showGroupModal()}>
              <EditGroup group={currentGroup()} onDiscard={() => setShowGroupModal(false)} onConfirm={createGroup} />
            </Show>
            <section class={styles.content}>
              <Switch fallback={<p>Loading...</p>}>
                <Match when={typeof groups() === 'object'}>
                  {//<NotesBoard notes={filteredGroups} onDelete={onDeleteGroup} onEdit={showModal} onModified={onModifiedGroup} onTagClicked={onTagClicked} />
                  }
                  <div style={{ display: 'flex', "flex-direction": "column" }}>
                    <For each={filteredGroups()}>{(group) => {
                      return <div style={
                        {
                          "border": "0.1px solid white",
                          "border-radius": "10px",
                          padding: "15px 10px",
                          margin: "2px",
                          width: "200px"
                        }
                      }><label>{group.name}</label></div>
                    }}</For>
                  </div>
                </Match>
              </Switch>
            </section>
          </main>
        </Match>
      </Switch>
    </div >
  )
}
