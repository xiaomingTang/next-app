'use server'

import { getMP3s } from '@/app/admin/customMP3/server'
import { InjectGlobalVariables } from '@/components/InjectGlobalVariables'
import { ServerComponent } from '@/components/ServerComponent'

import { Suspense } from 'react'

export async function ServerProvider({
  children,
}: {
  children: React.ReactNode | React.ReactNode[]
}) {
  return (
    <Suspense
      fallback={
        <InjectGlobalVariables variables={{ mp3s: globalThis.mp3s ?? [] }}>
          {children}
        </InjectGlobalVariables>
      }
    >
      <ServerComponent
        api={() => getMP3s({})}
        render={(value) => (
          <InjectGlobalVariables variables={{ mp3s: value }}>
            {children}
          </InjectGlobalVariables>
        )}
        errorBoundary={() => (
          <InjectGlobalVariables variables={{ mp3s: globalThis.mp3s ?? [] }}>
            {children}
          </InjectGlobalVariables>
        )}
      />
    </Suspense>
  )
}
