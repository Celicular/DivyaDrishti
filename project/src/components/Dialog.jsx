import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'

export default function Dialog({ title, onClose, className = '', children }) {
  const dialogRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    return () => dialog.close()
  }, [])

  return (
    <dialog ref={dialogRef} className={`app-dialog ${className}`} aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose() }} onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className="dialog-header"><h2 id={titleId}>{title}</h2><button className="dialog-close" onClick={onClose} aria-label={`Close ${title}`} autoFocus><X size={22} /></button></div>
      <div className="dialog-content">{children}</div>
    </dialog>
  )
}
