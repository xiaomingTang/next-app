import ListTtsTaskPage from './ListTtsTaskPage'

import { seo } from '@/utils/seo'

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'

export const metadata = seo.defaults({
  title: '语音合成任务列表',
  keywords: 'tts,语音合成,文字转语音,文本转语音',
})

export default function Page() {
  /*
   * 渲染TTS任务列表页面
   */
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>内容</TableCell>
            <TableCell>状态</TableCell>
            <TableCell>操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <ListTtsTaskPage />
        </TableBody>
      </Table>
    </TableContainer>
  )
}
