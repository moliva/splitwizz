import { Accessor, For, createEffect, createSignal } from "solid-js";

import appStyles from '../App.module.css'
import styles from './Tags.module.css'

export type TagsProps = {
  tags: Accessor<string[] | undefined>
  activeTag?: Accessor<string | undefined>
  topTagLength: Accessor<number>

  class?: string

  onTagClicked(tag: string): void
}

const TAG_STATIC_SIZE = 6 + 1 + 2 // padding 6 + border 1 + gap 2
const TAG_CHAR_SIZE = 5.70 // content (~6px per char)

export function Tags(props: TagsProps) {
  const { tags, activeTag, topTagLength, onTagClicked } = props;

  const [topTags, setTopTags] = createSignal<string[]>([])

  createEffect(() => {
    const initialTags = tags() ?? []
    const topLength = topTagLength()

    const topTags = []
    let size = 0

    for (const tag of initialTags) {
      const currentSize = TAG_STATIC_SIZE + tag.length * TAG_CHAR_SIZE

      if (size + currentSize > topLength)
        break

      topTags.push(tag)
      size += currentSize
    }

    setTopTags(topTags)
  })

  return <div class={`${props.class ?? ''} ${styles['note-tags']}`}>
    <For each={topTags()}>{
      (tag) => <label class={`${styles['note-tag']} ${appStyles.button}`} classList={{ [styles.active]: activeTag?.() === tag }} onClick={() => onTagClicked(tag)}>{tag}</label>
    }</For>
  </div >
}
