import { getRootProjectMenu, getRootProjectMeta } from '../../server'
import { ProjectPage } from '../../components/ProjectPage'
import { arrayToTree } from '../../utils/arrayToTree'

import { ServerComponent } from '@/components/ServerComponent'
import { seo } from '@/utils/seo'

import { Suspense } from 'react'

import type { Metadata } from 'next'

interface Params {
  hash: string
  paths?: string[]
}

interface Props {
  params: Promise<Params>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params

  const { hash } = params

  const { data: project } = await getRootProjectMeta({
    hash,
  })

  return seo.defaults({
    title: project?.name,
  })
}

export default async function Index(props: Props) {
  const params = await props.params

  const { hash, paths: rawPaths } = params

  const paths = (rawPaths ?? []).map((p) => decodeURIComponent(p))
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
