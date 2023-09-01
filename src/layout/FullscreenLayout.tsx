import { DefaultRawHeader } from './DefaultHeader'
import { FilePasteCatcher } from './components/FilePasteCatcher'

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
      <FilePasteCatcher />
      <DefaultRawHeader />
      {children}
    </>
  )
}
