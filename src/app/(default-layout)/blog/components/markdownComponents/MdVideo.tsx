export function MdVideo({
  src = '',
  poster = '',
}: {
  src?: string
  poster?: string
}) {
  if (!src) {
    return null
  }
  return (
    <video
      src={src}
      poster={poster}
      width={720}
      height={450}
      controls
      autoPlay={false}
      style={{
        width: '100%',
        maxWidth: 720,
      }}
    />
  )
}
