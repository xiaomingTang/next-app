import { DefaultFooter } from './DefaultFooter'
import { DefaultHeader } from './DefaultHeader'

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode | React.ReactNode[]
}) {
  return (
    <>
      <div className='w-full min-h-screen'>
        <DefaultHeader />
        {children}
      </div>
      <DefaultFooter />
    </>
  )
}
