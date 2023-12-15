import { DefaultRawHeader } from './DefaultHeader'
import { FileUploadCatcher } from './components/FileUploadCatcher'

export default function FullscreenLayout({
  children,
}: {
  children: React.ReactNode | React.ReactNode[]
}) {
  return (
    <>
      {/* 不能 import css，否则从全屏页面切换到其他页面时，body height 100% 样式还会存在 */}
      <style>{`
        html,
        body {
          width: 100%;
          height: 100%;
        }
      `}</style>
      <FileUploadCatcher />
      <DefaultRawHeader />
      {children}
    </>
  )
}
