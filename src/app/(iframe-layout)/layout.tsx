import { GA } from '@/analytics/GA'

export default function Index({ children }: { children: React.ReactNode }) {
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
      <GA />
      {children}
    </>
  )
}
