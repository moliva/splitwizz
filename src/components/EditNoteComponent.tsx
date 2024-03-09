import { Note } from "../types"

import { contentToString, parseContent } from "../utils"

import appStyles from '../App.module.css'
import styles from './EditNoteComponent.module.css'

export type EditNoteProps = {
  note: Note | undefined
  onConfirm(note: Note): void
  onDiscard(): void
}

export function parseTags(tagString: string): string[] {
  return tagString.split(',').filter(line => line.length).map((line) => line.trim().toLowerCase())
}

export const EditNote = (props: EditNoteProps) => {
  const { note } = props

  let newNoteName, newNoteContent, colorRef, tagsRef

  const newNote = () => ({
    id: note?.id,
    name: newNoteName!.value,
    color: colorRef!.value,
    content: parseContent(newNoteContent!.value),
    tags: parseTags(tagsRef!.value)
  } as Note)

  return <div class={styles.modal}>
    <div class={styles["modal-content"]}>
      <input ref={newNoteName} class={styles['modal-name']} placeholder="Note name" value={note?.name ?? ''}></input>
      <input ref={tagsRef} class={styles['modal-tags']} placeholder="Comma separated tags" value={note?.tags.join(',') ?? ''}></input>
      <textarea ref={newNoteContent} placeholder="Stuff..." rows="10">{note ? contentToString(note?.content) : ''}</textarea>
      <div class={styles['modal-controls']}>
        <input ref={colorRef} type="color" value={note?.color ?? '#404040'} />
        <button class={`${appStyles.button} ${appStyles.primary}`} onClick={() => props.onConfirm(newNote())}>{note ? 'Edit' : 'Create'}</button>
        <button class={`${appStyles.button} ${appStyles.secondary}`} onClick={props.onDiscard}>Discard</button>
      </div>
    </div>
  </div>
}
