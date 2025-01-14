'use server'

import { guessContentType } from './utils/guessContentType'

import { SA, toError } from '@/errors/utils'
import { prisma } from '@/request/prisma'
import { zf } from '@/request/validator'
import { getSelf } from '@/user/server'
import { validateFileName as rawValidateFileName } from '@/utils/string'
import { optionalString } from '@/request/utils'

import Boom from '@hapi/boom'
import { ContentType, ProjectType } from '@prisma/client'
import { z } from 'zod'
import { nanoid } from 'nanoid'

const select = {
  hash: true,
  createdAt: true,
  updatedAt: true,
  name: true,
  type: true,
  contentType: true,
  parentHash: true,
}

function validateFileName(name: string) {
  try {
    return rawValidateFileName(name)
  } catch (error) {
    throw Boom.badRequest(toError(error).message)
  }
}

const getRootProjectMetaDto = z.object({
  hash: z.string().min(1).max(100),
})

export const getRootProjectMeta = SA.encode(
  zf(getRootProjectMetaDto, async ({ hash }) => {
    const project = await prisma.project.findUnique({
      where: { hash, deleted: false },
      select: { name: true },
    })
    if (!project) {
      throw Boom.notFound(`项目不存在: ${hash}`)
    }
    return project
  })
)

const getRootProjectMenuDto = z.object({
  hash: z.string().min(1).max(100),
})

/**
 * 客户端自己转成树吧
 */
export const getRootProjectMenu = SA.encode(
  zf(getRootProjectMenuDto, async ({ hash }) => {
    const projects = await prisma.project.findMany({
      where: { rootHash: hash, deleted: false },
      select,
      orderBy: {
        parentHash: 'asc',
      },
    })
    if (projects.length === 0) {
      throw Boom.notFound(`项目不存在: ${hash}`)
    }
    return projects
  })
)

const createRootProjectDto = z.object({
  name: z.string().max(200),
})

export const createRootProject = SA.encode(
  zf(createRootProjectDto, async ({ name }) => {
    const user = await getSelf()
    // 获取该用户所有项目中各个 rootHash 及数量
    const rootHashes = await prisma.project.groupBy({
      by: ['rootHash'],
      where: { creatorId: user.id, deleted: false },
      _count: {
        rootHash: true,
      },
      having: {
        rootHash: {
          _count: {
            equals: 1,
          },
        },
      },
    })
    const emptyProjectHash = rootHashes[0]?.rootHash
    if (emptyProjectHash) {
      return prisma.project.findUniqueOrThrow({
        where: { hash: emptyProjectHash, deleted: false },
        select,
      })
    }
    const rootHash = nanoid(12)
    const project = await prisma.project.create({
      data: {
        hash: rootHash,
        name,
        type: ProjectType.DIR,
        creatorId: user.id,
        rootHash,
        parentHash: rootHash,
      },
      select,
    })
    return project
  })
)

const createProjectDto = z.object({
  name: z.string().min(1).max(200),
  parentHash: z.string().min(1).max(100),
  type: z.nativeEnum(ProjectType),
  contentType: z.nativeEnum(ContentType).optional(),
})

/**
 * create dir or file
 */
export const createProject = SA.encode(
  zf(
    createProjectDto,
    async ({ name, parentHash, type, contentType: inputContentType }) => {
      const user = await getSelf()
      const parent = await prisma.project.findUnique({
        where: {
          hash: parentHash,
          deleted: false,
          creatorId: user.id,
          type: ProjectType.DIR,
        },
        select: { rootHash: true },
      })
      if (!parent) {
        throw Boom.notFound(`父项目不存在: ${parentHash}`)
      }
      const contentType =
        inputContentType ||
        (type === ProjectType.DIR ? undefined : guessContentType(name))
      const formattedName = validateFileName(name)
      const projectOfTheName = await prisma.project.findFirst({
        where: { name: formattedName, parentHash, deleted: false },
      })
      if (projectOfTheName) {
        throw Boom.conflict(`同名文件（夹）已存在: ${formattedName}`)
      }
      const project = await prisma.project.create({
        data: {
          hash: nanoid(12),
          name: formattedName,
          type,
          creatorId: user.id,
          rootHash: parent.rootHash,
          parentHash,
          contentType,
        },
      })
      return project
    }
  )
)

const deleteProjectDto = z.object({
  hash: z.string(),
})

export const deleteProject = SA.encode(
  zf(deleteProjectDto, async ({ hash }) => {
    const user = await getSelf(true)
    if (user.role === 'ADMIN') {
      await prisma.project.updateMany({
        where: {
          OR: [
            { hash, deleted: false },
            { parentHash: hash, deleted: false },
            { rootHash: hash, deleted: false },
          ],
        },
        data: { deleted: true },
      })
    }
    await prisma.project.updateMany({
      where: {
        OR: [
          { hash, deleted: false, creatorId: user.id },
          { parentHash: hash, deleted: false, creatorId: user.id },
          { rootHash: hash, deleted: false, creatorId: user.id },
        ],
      },
      data: { deleted: true },
    })
  })
)

const updateProjectDto = z.object({
  hash: z.string().min(1).max(100),
  name: optionalString(z.string().min(1).max(200)),
  content: optionalString(z.string()),
})

export type UpdateProjectProps = z.infer<typeof updateProjectDto>

export const updateProject = SA.encode(
  zf(updateProjectDto, async ({ hash, name, content }) => {
    const newName = name ? validateFileName(name) : undefined
    const user = await getSelf()
    const file = await prisma.project.update({
      where: {
        hash,
        deleted: false,
        creatorId: user.id,
      },
      data: { name: newName, content },
      select,
    })
    return file
  })
)

const ClipboardActionDto = z.object({
  hash: z.string().min(1).max(100),
  parentHash: z.string().min(1).max(100),
  action: z.enum(['COPY', 'CUT']),
})

/**
 * 纯文本文件才能复制，其他都只能剪切
 */
export const projectClipboardAction = SA.encode(
  zf(ClipboardActionDto, async ({ hash, parentHash, action }) => {
    if (hash === parentHash) {
      throw Boom.badRequest('目标目录与原目录相同')
    }
    const user = await getSelf()
    const project = await prisma.project.findUnique({
      where: { hash, deleted: false, creatorId: user.id },
      select: {
        ...select,
        content: true,
        rootHash: true,
      },
    })
    if (!project) {
      throw Boom.notFound(`项目不存在: ${hash}`)
    }
    if (action === 'COPY' && project.type !== ProjectType.TEXT) {
      throw Boom.badRequest('只能复制纯文本文件')
    }
    const parent = await prisma.project.findUnique({
      where: {
        hash: parentHash,
        rootHash: project.rootHash,
        type: 'DIR',
        deleted: false,
        creatorId: user.id,
      },
      select,
    })
    if (!parent) {
      throw Boom.notFound(`目标目录不存在该项目中: ${parentHash}`)
    }
    if (project.parentHash === parentHash) {
      throw Boom.badRequest('目标目录与原目录相同')
    }

    // 检查目标目录是否是自己的后代目录
    const isDescendants = await prisma.$queryRaw<{ isDescendant: boolean }[]>`
      WITH RECURSIVE descendants AS (
        SELECT hash
        FROM Project
        WHERE parentHash = ${hash}
        UNION ALL
        SELECT p.hash
        FROM Project p
        INNER JOIN descendants d ON p.parentHash = d.hash
      )
      SELECT EXISTS (
        SELECT 1
        FROM descendants
        WHERE hash = ${parentHash}
      ) AS isDescendant;
    `
    const isDescendant = !!isDescendants[0]?.isDescendant
    if (isDescendant) {
      throw Boom.badRequest('目标目录不能是自己的后代目录')
    }

    if (action === 'COPY') {
      const newProject = await prisma.project.create({
        data: {
          ...project,
          hash: nanoid(12),
          creatorId: user.id,
          parentHash,
        },
        select,
      })
      return newProject
    }
    await prisma.project.update({
      where: { hash },
      data: { parentHash },
    })
    return {
      ...project,
      parentHash,
    }
  })
)
