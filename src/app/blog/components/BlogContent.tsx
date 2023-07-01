import { friendlyFormatTime } from '@/utils/formatTime'

import clsx from 'clsx'

import type { BlogWithTags } from '@/app/admin/blog/components/server'

export function BlogContent({
  className,
  ...blog
}: BlogWithTags & {
  className?: string
}) {
  return (
    <div
      className={clsx('flex flex-col flex-1 p-2 overflow-x-auto', className)}
    >
      <h3 className='font-bold flex-none text-lg text-primary-dark'>
        {blog.title}
      </h3>
      <div className='text-sm flex-auto  text-primary-light'>
        {blog.content}
      </div>
      <div className='text-xs scrollbar-thin scrollbar-track-b-100 flex-none flex justify-start items-center text-primary-light px-[2px] overflow-x-auto'>
        <time
          dateTime={friendlyFormatTime(blog.updatedAt)}
          className='mr-2 whitespace-nowrap'
        >
          {friendlyFormatTime(blog.updatedAt)}
        </time>
      </div>
    </div>
  )
}
