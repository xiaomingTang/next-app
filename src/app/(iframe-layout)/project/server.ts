'use server'

import { SA, toError } from '@/errors/utils'
import { prisma } from '@/request/prisma'
import { zf } from '@/request/validator'
import { authValidate, getSelf } from '@/user/server'
import { validateFileName as rawValidateFileName } from '@/utils/string'
import { optionalString } from '@/request/utils'

import Boom from '@hapi/boom'
import { ProjectType } from '@prisma/client'
import { z } from 'zod'
import { nanoid } from 'nanoid'

const select = {
  hash: true,
  createdAt: true,
  updatedAt: true,
  name: true,
  type: true,
  parentHash: true,
  creatorId: true,
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
      throw Boom.notFound(`项目不存在或已删除: ${hash}`)
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
      orderBy: [
        { type: 'asc' },
        {
          name: 'asc',
        },
      ],
    })
    if (projects.length === 0) {
      throw Boom.notFound(`项目不存在或已删除: ${hash}`)
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
  content: optionalString(z.string()),
})

export type CreateProjectProps = z.infer<typeof createProjectDto>

/**
 * create dir or file
 */
export const createProject = SA.encode(
  zf(createProjectDto, async ({ name, parentHash, type, content }) => {
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
      throw Boom.notFound(`父项目不存在或已删除: ${parentHash}`)
    }
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
        content,
      },
    })
    return project
  })
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

const resumeProjectDto = z.object({
  hash: z.string(),
})

export const resumeProject = SA.encode(
  zf(resumeProjectDto, async ({ hash }) => {
    const user = await getSelf(true)
    if (user.role === 'ADMIN') {
      await prisma.project.updateMany({
        where: {
          OR: [
            { hash, deleted: true },
            { parentHash: hash, deleted: true },
            { rootHash: hash, deleted: true },
          ],
        },
        data: { deleted: false },
      })
    }
    await prisma.project.updateMany({
      where: {
        OR: [
          { hash, deleted: true, creatorId: user.id },
          { parentHash: hash, deleted: true, creatorId: user.id },
          { rootHash: hash, deleted: true, creatorId: user.id },
        ],
      },
      data: { deleted: false },
    })
  })
)

const updateProjectDto = z.object({
  hash: z.string().min(1).max(100),
  name: optionalString(z.string().min(1).max(200)),
  content: optionalString(z.string()),
  type: z.nativeEnum(ProjectType).optional(),
})

export type UpdateProjectProps = z.infer<typeof updateProjectDto>

export const updateProject = SA.encode(
  zf(updateProjectDto, async ({ hash, name, content, type }) => {
    const newName = name ? validateFileName(name) : undefined
    const user = await getSelf()
    const file = await prisma.project.update({
      where: {
        hash,
        deleted: false,
        creatorId: user.id,
      },
      data: { name: newName, content, type },
      select,
    })
    return file
  })
)

const clipboardActionDto = z.object({
  hash: z.string().min(1).max(100),
  parentHash: z.string().min(1).max(100),
  action: z.enum(['COPY', 'CUT']),
})

/**
 * 纯文本文件才能复制，其他都只能剪切
 */
export const projectClipboardAction = SA.encode(
  zf(clipboardActionDto, async ({ hash, parentHash, action }) => {
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
      throw Boom.notFound(`项目不存在或已删除: ${hash}`)
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
      throw Boom.notFound(`目标目录不存在或已删除: ${parentHash}`)
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

    // 目标目录中是否已存在同名文件
    const projectOfTheName = await prisma.project.findFirst({
      where: { name: project.name, parentHash, deleted: false },
    })
    if (projectOfTheName) {
      throw Boom.conflict(`同名文件（夹）已存在: ${project.name}`)
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

const getProjectContentDto = z.object({
  hash: z.string().min(1).max(100),
})

export const getProjectContent = SA.encode(
  zf(getProjectContentDto, async ({ hash }) => {
    const project = await prisma.project.findUnique({
      where: { hash, deleted: false },
      select: { content: true },
    })
    if (!project) {
      throw Boom.notFound(`项目不存在或已删除: ${hash}`)
    }
    return project.content
  })
)

export const getAllProjects = SA.encode(async () => {
  await authValidate(await getSelf(), { roles: ['ADMIN'] })
  const projects = await prisma.project.findMany({
    where: {
      rootHash: {
        equals: prisma.project.fields.hash,
      },
    },
    select: {
      ...select,
      deleted: true,
    },
  })
  return projects
})
