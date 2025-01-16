'use server'

import { createRootProject } from '../server'

import { SA, toPlainError } from '@/errors/utils'

import { unstable_noStore as noStore } from 'next/cache'
import { redirect } from 'next/navigation'

import type { SA_RES } from '@/errors/utils'

export async function GET() {
  noStore()
  let project: SA_RES<typeof createRootProject>
  try {
    project = await createRootProject({
      name: '未命名项目',
    }).then(SA.decode)
  } catch (err) {
    const error = toPlainError(err)
    if (error.code === 401) {
      redirect('/admin')
    }
    return Response.json(error)
  }
  redirect(`/project/${project.hash}`)
}
