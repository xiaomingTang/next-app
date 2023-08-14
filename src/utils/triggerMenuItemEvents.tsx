type Listener = ((
  e: React.MouseEvent<HTMLLIElement, MouseEvent>,
  reason: 'click'
) => void) &
  ((
    e: React.MouseEvent<HTMLLIElement, MouseEvent>,
    reason: 'middleClick'
  ) => void) &
  ((e: React.KeyboardEvent<HTMLLIElement>, reason: 'enter') => void)

export function triggerMenuItemEvents(callback: Listener) {
  return {
    onClick: (e: React.MouseEvent<HTMLLIElement, MouseEvent>) =>
      callback(e, 'click'),
    onMouseDown: (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
      // 中键
      if (e.button === 1) {
        e.preventDefault()
        callback(e, 'middleClick')
      }
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLLIElement>) => {
      if (e.key === 'Enter') {
        callback(e, 'enter')
      }
    },
  }
}
