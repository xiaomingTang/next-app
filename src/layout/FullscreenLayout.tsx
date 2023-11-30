import { DefaultRawHeader } from './DefaultHeader'
import { FileUploadCatcher } from './components/FileUploadCatcher'

/**
 * you should import FullscreenLayout.css in page.tsx
 */
export default function FullscreenLayout({
  children,
}: {
  children: React.ReactNode | React.ReactNode[]
}) {
  return (
    <>
      <FileUploadCatcher />
      <DefaultRawHeader />
      {children}
    </>
  )
}
