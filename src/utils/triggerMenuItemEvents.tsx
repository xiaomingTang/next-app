import 'client-only'

type Listener = ((
  e: React.MouseEvent<HTMLElement, MouseEvent>,
  reason: 'click'
) => void | Promise<void>) &
  ((
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    reason: 'middleClick'
  ) => void | Promise<void>) &
  ((
    e: React.KeyboardEvent<HTMLElement>,
    reason: 'enter'
  ) => void | Promise<void>)

export function triggerMenuItemEvents(callback: Listener) {
  return {
    onClick: (e: React.MouseEvent<HTMLElement, MouseEvent>) =>
      callback(e, 'click'),
    onMouseDown: (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      // 中键
      if (e.button === 1) {
        e.preventDefault()
        void callback(e, 'middleClick')
      }
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Enter') {
        void callback(e, 'enter')
      }
    },
  }
}
