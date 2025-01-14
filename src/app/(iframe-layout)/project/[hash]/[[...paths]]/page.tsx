import { getRootProjectMenu, getRootProjectMeta } from '../../server'
import { ProjectPage } from '../../components/ProjectPage'
import { arrayToTree } from '../../utils/arrayToTree'

import { ServerComponent } from '@/components/ServerComponent'
import { seo } from '@/utils/seo'

import { Suspense } from 'react'

import type { Metadata } from 'next'

interface Props {
  params: { hash: string; paths: string[] }
}

export async function generateMetadata({
  params: { hash },
}: Props): Promise<Metadata> {
  const { data: project } = await getRootProjectMeta({
    hash,
  })

  return seo.defaults({
    title: project?.name,
  })
}

export default async function Index({ params: { hash, paths } }: Props) {
  return (
    <>
      <Suspense fallback={<ProjectPage loading size={1} />}>
        <ServerComponent
          api={() => getRootProjectMenu({ hash })}
          render={(projectInfo) => (
            <ProjectPage projectTree={arrayToTree(projectInfo)} paths={paths} />
          )}
          errorBoundary={(error) => (
            <ProjectPage loading size={1} error={error} />
          )}
        />
      </Suspense>
    </>
  )
}
