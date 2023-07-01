import { friendlyFormatTime } from '@/utils/formatTime'
import Anchor from '@/components/Anchor'

import clsx from 'clsx'

import type { BlogWithTags } from '@/app/admin/blog/components/server'

export function BlogItem({
  className,
  ...blog
}: BlogWithTags & {
  className?: string
}) {
  return (
    <Anchor
      className={clsx(
        'flex items-stretch text-left w-full rounded overflow-hidden bg-white bg-opacity-50 text-primary-light',
        'outline focus:outline-1 desktop:hover:outline-1',
        className
      )}
      href={`/blog/${blog.hash}`}
      aria-labelledby={`博客: ${blog.title}`}
    >
      <div className='flex flex-col flex-1 p-2 overflow-x-auto'>
        <h3 className='font-bold flex-none text-lg text-primary-dark'>
          {blog.title}
        </h3>
        <div className='text-sm flex-auto  text-primary-light'>
          <div className='line-clamp-2 tablet:line-clamp-3'>{blog.content}</div>
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
    </Anchor>
  )
}
