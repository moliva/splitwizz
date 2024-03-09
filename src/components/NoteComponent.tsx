import { createSignal, onMount } from 'solid-js'

import Fa from 'solid-fa'
import { faPenToSquare, faXmark, faClipboard, faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons'

import { deepCopy } from "deep-copy-ts"

import { Note } from '../types'
import { WRAPPING_SIZE, contentToString, copyToClipboard, noteSize } from '../utils'

import { ContentComponent } from './ContentComponent'
import { Tags } from './Tags'

import styles from './NoteComponent.module.css'
import appStyles from '../App.module.css'

export type NoteProps = {
  note: Note

  onDelete(note: Note): void
  onEdit(note: Note): void
  onModified(note: Note): void
  onTagClicked(tag: string): void
}

export const NoteComponent = (props: NoteProps) => {
  const { note, onTagClicked } = props

  const [collapsed, setCollapsed] = createSignal(false)
  const [showingMore, setShowingMore] = createSignal(false)

  const [topTagLength] = createSignal(370) // approx size per note
  const [tags, setTags] = createSignal<string[] | undefined>()

  const toggleCollapsed = () => {
    setCollapsed(!collapsed())
  }

  const onCheckToggle = (indices: number[]) => {
    const copy = deepCopy(note)
    let check = copy.content
    let last
    for (const index of indices) {
      last = check[index]
      check = last[1]
    }

    last = (last as any)[0]
    last.check = !last.check

    props.onModified(copy)
  }

  const isLarge = noteSize(note) > WRAPPING_SIZE

  onMount(() => {
    setTags(note.tags)
  })

  return <div class={styles.note} style={{ '--note-color': note.color }}>
    <div class={styles['note-header']}>
      <div class={styles['note-label']}>
        <button style={{ "min-width": '16px', 'text-align': 'center' }} onClick={toggleCollapsed}><Fa icon={collapsed() ? faChevronRight : faChevronDown} class={`${appStyles.button} ${styles.arrow}`} /></button>
        <strong class={styles['note-name']}>{note.name}</strong>
      </div>
      <div class={styles['note-controls']}>
        <button class={`${styles['edit-control']} ${styles['note-control']}`} onClick={() => props.onEdit(note)}><Fa icon={faPenToSquare} /></button>
        <button class={`${styles['copy-control']} ${styles['note-control']}`} onClick={() => copyToClipboard(contentToString(note.content))}><Fa icon={faClipboard} /></button>
        <button class={`${styles['delete-control']} ${styles['note-control']}`} onClick={() => props.onDelete(note)}><Fa icon={faXmark} /></button>
      </div>
    </div>
    <Tags class={styles['note-tags']} topTagLength={topTagLength} tags={tags} onTagClicked={onTagClicked} />
    {
      collapsed() ? null : <>
        {isLarge && !showingMore()
          ? <div class={styles['note-constrain']}><ContentComponent content={note.content} initial onCheckToggle={onCheckToggle} /></div>
          : <ContentComponent content={note.content} initial onCheckToggle={onCheckToggle} />
        }
        {isLarge ? <span class={`${styles['note-expand-control']} ${appStyles.button}`} onClick={() => setShowingMore(!showingMore())}>{showingMore() ? 'Show less' : 'Show more'}</span> : null}
      </>
    }
  </div >
}

