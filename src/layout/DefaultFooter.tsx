'use client'

import Anchor from '@/components/Anchor'
import { SvgGithub } from '@/svg'
import { dark, light } from '@/utils/theme'

import { Stack, Typography } from '@mui/material'
import { common, grey } from '@mui/material/colors'

const year = new Date().getFullYear()

export function DefaultFooter() {
  return (
    <Stack
      component='footer'
      spacing={1}
      direction={{
        xs: 'column',
        sm: 'row',
      }}
      sx={{
        alignItems: 'center',
        px: 2,
        py: 3,
        fontSize: '0.875rem',
        [dark()]: {
          backgroundColor: grey[800],
        },
        [light()]: {
          backgroundColor: common.white,
        },
      }}
    >
      <Stack
        spacing={1}
        direction={{
          xs: 'column',
          sm: 'row',
        }}
        sx={{
          flexGrow: 1,
        }}
      >
        <Stack spacing={1} direction='row' justifyContent='center'>
          <Typography aria-label={`版权声明: ${year} 年`}>© {year}</Typography>
          <Anchor
            href='https://github.com/xiaomingTang'
            className='flex justify-center items-center'
            aria-label='王小明的 github'
          >
            <SvgGithub />
            小明123
          </Anchor>
        </Stack>
      </Stack>
      <Typography>
        Powered by
        <Anchor href='https://nextjs.org/' className='ml-1'>
          Next.js
        </Anchor>
      </Typography>
    </Stack>
  )
}
