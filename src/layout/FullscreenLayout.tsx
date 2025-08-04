import { DefaultRawHeader } from './DefaultHeader'

import dynamic from 'next/dynamic'

const FileUploadCatcher = dynamic(() =>
  import('./components/FileUploadCatcher').then((res) => res.FileUploadCatcher)
)

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
          /* 防止 animate 的时候出现滚动条 */
          overflow: hidden;
        }
      `}</style>
      <FileUploadCatcher />
      <DefaultRawHeader />
      {children}
    </>
  )
}
