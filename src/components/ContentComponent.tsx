import { For, createSignal } from 'solid-js'

import Fa from 'solid-fa'
import { faEllipsis } from '@fortawesome/free-solid-svg-icons'

import { Content } from "../types"

import { LineComponent } from './LineComponent'

import styles from './ContentComponent.module.css'

export type ContentProps = {
  initial?: boolean
  content: Content

  onCheckToggle(indices: number[]): void
}

export const ContentComponent = (props: ContentProps) => {
  const { content, initial } = props

  return <div class={initial ? styles['content-initial'] : styles.content}>
    <For each={content}>{
      ([key, value], i) => {
        const [collapsed, setCollapsed] = createSignal(false)

        const toggleCollapsed = () => setCollapsed(!collapsed())

        return <>
          <LineComponent key={key} collapsed={collapsed} hasChildren={value.length > 0} toggleCollapsed={toggleCollapsed} onCheckToggle={() => props.onCheckToggle([i()])} />
          {collapsed()
            ? <button onClick={toggleCollapsed}><Fa class={`${styles.content} ${styles['content-collapsed']}`} icon={faEllipsis} /></button>
            : <ContentComponent content={value} onCheckToggle={(indices) => props.onCheckToggle([i(), ...indices])} />}
        </>
      }
    }</For>
  </div>
}
