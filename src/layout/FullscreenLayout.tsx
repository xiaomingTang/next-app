import { DefaultRawHeader } from './DefaultHeader'

export default function FullscreenLayout({
  children,
}: {
  children: React.ReactNode | React.ReactNode[]
}) {
  return (
    <div className='w-full h-screen'>
      <DefaultRawHeader />
      {children}
    </div>
  )
}
