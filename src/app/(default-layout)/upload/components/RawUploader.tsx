import type { InputHTMLAttributes } from 'react'

interface AudioUploaderProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'onInput' | 'style' | 'type'
  > {
  onChange?: (files: File[]) => void
}

export function RawUploader(props: AudioUploaderProps) {
  const { onChange, autoFocus = true, ...restProps } = props
  return (
    <input
      type='file'
      style={{
        opacity: 0,
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        cursor: 'pointer',
      }}
      autoFocus={autoFocus}
      {...restProps}
      onInput={(e) => {
        const target = e.target as HTMLInputElement
        onChange?.(Array.from(target.files ?? []))
      }}
    />
  )
}
