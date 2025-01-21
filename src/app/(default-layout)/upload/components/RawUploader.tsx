interface AudioUploaderProps {
  accept?: string
  multiple?: boolean
  onChange?: (files: File[]) => void
}

export function RawUploader({
  onChange,
  multiple,
  accept,
}: AudioUploaderProps) {
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
      autoFocus
      multiple={multiple}
      accept={accept}
      onInput={(e) => {
        const target = e.target as HTMLInputElement
        onChange?.(Array.from(target.files ?? []))
      }}
    />
  )
}
