import { CidForm } from './components/CidForm'

import { seo } from '@/utils/seo'

import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'

export const metadata = seo.defaults({
  title: '学习生成随机身份证',
  description: '信息都是随机生成的，仅用于学习与分享，严禁用于非法用途。',
})

export default function Home() {
  return (
    <Stack spacing={2}>
      <Alert severity='warning'>
        信息都是随机生成的，仅用于学习与分享，严禁用于非法用途。
      </Alert>
      <CidForm />
    </Stack>
  )
}
