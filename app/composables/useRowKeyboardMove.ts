import { onMounted, onBeforeUnmount } from 'vue'

export function useRowKeyboardMove() {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return

    const target = e.target as HTMLElement
    if (!target) return

    const input = target.closest('input, textarea, .q-field__native, [contenteditable]')
    if (!input) return

    const td = input.closest('td[data-row-index]')
    if (!td) return

    const rowIndex = Number(td.dataset.rowIndex)
    if (Number.isNaN(rowIndex)) return

    const nextRowIndex = e.key === 'ArrowUp' ? rowIndex - 1 : rowIndex + 1

    if (nextRowIndex < 0) return

    const colIndex = Array.from(td.parentElement?.children || []).indexOf(td)
    if (colIndex < 0) return

    const tbody = td.closest('tbody')
    if (!tbody) return

    const rows = Array.from(tbody.children)
    const targetRow = rows[nextRowIndex] as HTMLElement | undefined
    if (!targetRow) return

    const targetTd = targetRow.children[colIndex] as HTMLElement | undefined
    if (!targetTd) return

    e.preventDefault()

    const nextInput = targetTd.querySelector<HTMLElement>('.q-field__native, input, textarea, [contenteditable]')

    nextInput?.focus()
  }

  onMounted(() => {
    document.addEventListener('keydown', onKeyDown, true)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeyDown, true)
  })
}
