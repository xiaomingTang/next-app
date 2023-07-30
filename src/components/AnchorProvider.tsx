import { useState } from 'react'

export function AnchorProvider({
  children,
}: {
  children: (
    anchorEl: null | HTMLElement,
    setAnchorEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>
  ) => React.ReactNode
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  return <>{children(anchorEl, setAnchorEl)}</>
}
