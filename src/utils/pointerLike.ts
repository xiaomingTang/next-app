export type PointerLikeEvent =
  | MouseEvent
  | TouchEvent
  | React.MouseEvent<HTMLElement, MouseEvent>
  | React.TouchEvent<HTMLElement>

export function getSingleEvent(e: PointerLikeEvent) {
  if ('clientX' in e) {
    return e
  }
  return e.touches[0]
}

export function pointerLikeHandler<T extends PointerLikeEvent>(
  callback: (e: ReturnType<typeof getSingleEvent>, rawEvent: T) => void
) {
  return (e: T) => {
    const singleEvent = getSingleEvent(e)
    callback(singleEvent, e)
  }
}
