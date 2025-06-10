import { Box } from '@mui/material'

export function NoLrc() {
  return (
    <Box sx={{ color: 'grey.500', userSelect: 'none' }}>
      <Box>歌词为空，你可以</Box>
      <ul className='list-disc list-inside mt-1'>
        <li>双击手动添加歌词</li>
        <li>
          拖拽{' '}
          <code className='inline-block px-0.5 bg-gray-300 rounded-sm'>
            .txt
          </code>{' '}
          /{' '}
          <code className='inline-block px-0.5 bg-gray-300 rounded-sm'>
            .lrc
          </code>{' '}
          文件到页面内
        </li>
        <li>点击右上角“设置”按钮，上传歌词文件</li>
      </ul>
    </Box>
  )
}

export function NoAudio() {
  return (
    <Box sx={{ color: 'grey.500', userSelect: 'none' }}>
      <Box>音乐为空，你可以</Box>
      <ul className='list-disc list-inside mt-1'>
        <li>拖拽音频文件到页面内</li>
        <li>点击右上角“设置”按钮，上传音频文件</li>
      </ul>
    </Box>
  )
}
