import { DefaultFooter } from './DefaultFooter'
import { DefaultHeader } from './DefaultHeader'

import dynamic from 'next/dynamic'

const FileUploadCatcher = dynamic(() =>
  import('./components/FileUploadCatcher').then((res) => res.FileUploadCatcher)
)

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode | React.ReactNode[]
}) {
  return (
    <>
      <FileUploadCatcher />
      <DefaultHeader />
      {children}
      <DefaultFooter />
    </>
  )
}
