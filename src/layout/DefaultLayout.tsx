import { DefaultFooter } from './DefaultFooter'
import { DefaultHeader } from './DefaultHeader'
import { FileUploadCatcher } from './components/FileUploadCatcher'

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
