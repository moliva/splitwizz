import { Accessor, createSignal } from "solid-js"

import Fa from "solid-fa"
import { faChevronDown, faChevronRight, faClipboard, faEye } from "@fortawesome/free-solid-svg-icons"

import { LineFormat } from "../types"

import { copyToClipboard } from '../utils'

import appStyles from '../App.module.css'
import noteStyles from './NoteComponent.module.css'
import styles from './LineComponent.module.css'

export type LineProps = {
  key: LineFormat
  hasChildren: boolean
  collapsed: Accessor<boolean>

  onCheckToggle(): void
  toggleCollapsed(): void
}

export const LineComponent = (props: LineProps) => {
  const { key, collapsed, hasChildren, toggleCollapsed, onCheckToggle } = props

  const [showMenu, setShowMenu] = createSignal(false)
  const [blur, setBlur] = createSignal(!!key.blur)

  const keyLine = key.link || key.line?.startsWith('http://') || key.line?.startsWith('https://')
    ? <a classList={{ [styles.blur]: blur() }} href={key.link ?? key.line} target="_blank" class={appStyles.link}>{key.line}</a>
    : <p classList={{ [styles.blur]: blur() }}>{key.line}</p>

  return <div class={styles['content-key']} onMouseEnter={() => setShowMenu(true)} onMouseLeave={() => setShowMenu(false)}>
    {key.checkbox ? <input type="checkbox" checked={!!key.check} onClick={onCheckToggle} /> : null}
    {keyLine}
    {showMenu() ? <div class={styles['content-controls']}>
      {key.blur
        ? <button class={`${styles['content-control']} ${styles['blur-control']}`} onClick={() => { setBlur(!blur()) }}><Fa icon={faEye} /></button>
        : null
      }
      <button class={`${styles['content-control']} ${noteStyles['copy-control']}`} onClick={() => { copyToClipboard(key.line!) }}><Fa icon={faClipboard} /></button>
      {hasChildren
        ? <button onClick={toggleCollapsed}><Fa class={`${appStyles.button} ${noteStyles.arrow}`} icon={collapsed() ? faChevronRight : faChevronDown} /></button>
        : null
      }
    </div> : null
    }
  </div >
}
