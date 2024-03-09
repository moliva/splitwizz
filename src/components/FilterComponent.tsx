import { Accessor, createSignal, onCleanup, onMount } from 'solid-js'

import { faEraser } from '@fortawesome/free-solid-svg-icons'
import Fa from 'solid-fa'

import noteStyles from './NoteComponent.module.css'
import styles from './FilterComponent.module.css'

export type FilterProps = {
  value: Accessor<string>

  onChange(value: string): void
}

export const Filter = (props: FilterProps) => {
  const { value, onChange } = props

  const [inputRef, setInputRef] = createSignal<HTMLElement | undefined>()

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
      const ref = inputRef()

      if (ref) {
        ref.focus()
      }
    }
  }

  onMount(() => window.addEventListener('keydown', handleKeydown, true))
  onCleanup(() => window.removeEventListener('keydown', handleKeydown))

  return <div class={styles.filter}>
    <input ref={setInputRef} class={styles['filter-input']} value={value()} placeholder="Filter..." onChange={(ev) => onChange(ev.target.value)} />
    <button class={`${styles['filter-button']} ${noteStyles['delete-control']}`} onClick={() => onChange("")}><Fa icon={faEraser} /></button>
  </div>
}
