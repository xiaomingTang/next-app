import { DefaultFooter } from './DefaultFooter'
import { DefaultHeader } from './DefaultHeader'
import { FilePasteCatcher } from './components/FilePasteCatcher'

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode | React.ReactNode[]
}) {
  return (
    <>
      <FilePasteCatcher />
      <DefaultHeader />
      {children}
      <DefaultFooter />
    </>
  )
}
