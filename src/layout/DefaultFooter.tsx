import { CopyrightYear } from './components/CopyrightYear'

import Anchor from '@/components/Anchor'
import Span from '@/components/Span'
import SvgGithub from '@/svg/assets/github.svg?icon'
import { dark } from '@/utils/theme'

import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { common, grey } from '@mui/material/colors'
import Image from 'next/image'

const V_LINE = (
  <Span sx={{ borderLeft: '1px solid currentColor', opacity: 0.25, mx: 1 }} />
)

export function DefaultFooter() {
  return (
    <Stack
      component='footer'
      spacing={1}
      direction={{
        xs: 'column',
        md: 'row',
      }}
      sx={{
        alignItems: 'center',
        px: 2,
        py: 3,
        fontSize: '0.875rem',
        backgroundColor: common.white,
        [dark()]: {
          backgroundColor: grey[800],
        },
      }}
    >
      <Stack
        spacing={1}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          flexGrow: 1,
        }}
      >
        <Stack spacing={1} direction='row' justifyContent='center'>
          <CopyrightYear />
        </Stack>
        <Stack spacing={1} direction='row' justifyContent='center'>
          <Anchor
            href='https://github.com/xiaomingTang/next-app/commits/main'
            className='flex justify-center items-center'
            title={`最近更新: ${process.env.NEXT_PUBLIC_LAST_COMMIT_MESSAGE}`}
          >
            <SvgGithub /> 最近更新
          </Anchor>
          <Anchor href='/comment' className='flex justify-center items-center'>
            向站长留言
          </Anchor>
        </Stack>
        <Anchor
          href='https://beian.miit.gov.cn/'
          className='block text-center'
          aria-label='ICP 备案号'
        >
          赣ICP备2021003257号-2
        </Anchor>
        <Anchor
          href='https://beian.mps.gov.cn/#/query/webSearch?code=44030002002476'
          className='flex justify-center items-center'
          aria-label='粤公网安备号'
        >
          <Image
            alt=''
            src='/static/images/公网安备-64x64.png'
            width={16}
            height={16}
            className='mr-1 select-none'
            role='presentation'
          />
          粤公网安备44030002002476号
        </Anchor>
      </Stack>
      <Typography>
        <Anchor href='/rss.xml' target='_blank'>
          RSS
        </Anchor>
        {V_LINE}
        <Span className='text-green-600'>ipv6</Span>
        {V_LINE}
        <Span>
          Powered by <Anchor href='https://nextjs.org/'>Next.js</Anchor>
        </Span>
      </Typography>
    </Stack>
  )
}
