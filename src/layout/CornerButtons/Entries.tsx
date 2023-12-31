import { Link } from '@/components/CustomLink'

import { Button } from '@mui/material'
import { usePathname } from 'next/navigation'

export function Entry({
  pathname,
  name,
}: {
  pathname: string
  name: React.ReactNode
}) {
  const curPathname = usePathname() ?? ''
  const isActive =
    curPathname === pathname ||
    (curPathname.startsWith(pathname) && curPathname.startsWith(`${pathname}/`))
  return (
    <Button
      variant='text'
      color={isActive ? 'primary' : 'inherit'}
      LinkComponent={Link}
      href={pathname}
      sx={{
        fontWeight: 'bold',
        fontSize: '1em',
        minWidth: 0,
        height: '100%',
        px: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {name}
    </Button>
  )
}
