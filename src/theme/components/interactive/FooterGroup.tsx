'use client'

import { useId, useState, type ReactNode } from 'react'
import { CaretIcon } from '../Icons'
import styles from '../../styles/layout.module.css'

/** A footer column: always open from tablets up, an accordion on phones. */
export const FooterGroup = ({ title, children }: { title: string; children: ReactNode }) => {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <div className={styles.group}>
      <h2 className={styles.groupHeading}>
        <button type="button" className={styles.groupHead} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
          {title}
          <CaretIcon className={styles.caret} />
        </button>
      </h2>
      <ul id={id} className={open ? styles.links : styles.linksClosed}>
        {children}
      </ul>
    </div>
  )
}
