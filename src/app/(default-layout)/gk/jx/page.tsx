import json from './gk.json'
import { GkTable } from './GkTable'

import Anchor from '@/components/Anchor'
import { seo } from '@/utils/seo'

import Typography from '@mui/material/Typography'

export const metadata = seo.defaults({
  title: '江西高校前 30000-70000 名的专业',
})

export default function Index() {
  return (
    <>
      <Typography
        component='h1'
        sx={{
          textAlign: 'center',
          fontSize: '1.5rem',
        }}
      >
        江西高校 物理类 前 30000-70000 名的专业
      </Typography>
      <Typography
        sx={{
          textAlign: 'end',
          marginBottom: '1rem',
          fontSize: '0.8rem',
          opacity: 0.8,
        }}
      >
        数据来源{' '}
        <Anchor href='https://xgk.jxeea.cn/zytb/history'>
          江西省教育考试院
        </Anchor>
      </Typography>
      <GkTable data={json} />
    </>
  )
}
