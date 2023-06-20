import Anchor from '@/components/Anchor'
import { ENV_CONFIG } from '@/config'
import { SvgGithub } from '@/svg'

const year = new Date().getFullYear()

export function DefaultFooter() {
  return (
    <footer className='flex flex-col md:flex-row justify-between items-center text-sm text-center px-4 py-6 bg-gray-200 dark:bg-gray-800'>
      <div className='flex flex-col md:flex-row justify-center items-center'>
        <div className='flex justify-center items-center'>
          <span aria-label={`版权声明: ${year} 年`}>© {year}</span>
          <Anchor
            href='https://github.com/xiaomingTang'
            className='flex justify-center items-center mx-2'
            aria-label='王小明的 github'
          >
            <SvgGithub className='text-base' />
            小明
          </Anchor>
          <Anchor href='/'>{ENV_CONFIG.manifest.short_name}</Anchor>
        </div>
        <Anchor
          href='https://beian.miit.gov.cn/'
          className='my-1 md:my-0 md:ml-2'
        >
          赣ICP备2021003257号-1
        </Anchor>
      </div>
      <div>
        Powered by
        <Anchor href='https://nextjs.org/' className='ml-1'>
          Next.js
        </Anchor>
      </div>
    </footer>
  )
}
