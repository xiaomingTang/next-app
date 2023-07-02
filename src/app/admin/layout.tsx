import { AdminLayout as RawAdminLayout } from './components/AdminLayout'

import { AuthRequired } from '@/components/AuthRequired'
import { Forbidden } from '@/components/Forbidden'

import { Role } from '@prisma/client'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthRequired roles={[Role.ADMIN, Role.USER]} fallback={<Forbidden />}>
      <RawAdminLayout>{children}</RawAdminLayout>
    </AuthRequired>
  )
}
