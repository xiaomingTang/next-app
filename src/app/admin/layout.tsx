import { AdminLayout } from './components/AdminLayout'

import { AuthRequired } from '@/components/AuthRequired'
import { Forbidden } from '@/components/Forbidden'
import { FileUploadCatcher } from '@/layout/components/FileUploadCatcher'

export default function Index({ children }: { children: React.ReactNode }) {
  return (
    <AuthRequired roles={['ADMIN', 'USER']} fallback={<Forbidden />}>
      <FileUploadCatcher />
      <AdminLayout>{children}</AdminLayout>
    </AuthRequired>
  )
}
