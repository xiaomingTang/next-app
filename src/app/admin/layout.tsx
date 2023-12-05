import { AdminLayout as RawAdminLayout } from './components/AdminLayout'

import { AuthRequired } from '@/components/AuthRequired'
import { Forbidden } from '@/components/Forbidden'
import { FileUploadCatcher } from '@/layout/components/FileUploadCatcher'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthRequired roles={['ADMIN', 'USER']} fallback={<Forbidden />}>
      <FileUploadCatcher />
      <RawAdminLayout>{children}</RawAdminLayout>
    </AuthRequired>
  )
}
