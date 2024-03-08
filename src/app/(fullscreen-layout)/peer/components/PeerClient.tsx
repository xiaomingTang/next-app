'use client'

import { SelfPeer } from './SelfPeer'
import { PeerConnections } from './PeerConnections'
import { RequestConnectionHandler } from './RequestConnectionHandler'
import { MessageEditor } from './MessageEditor'
import { MessageViewer } from './MessageViewer'

import { DefaultHeaderShim } from '@/layout/DefaultHeader'
import { STYLE } from '@/config'

import { Stack } from '@mui/material'

export function PeerClient() {
  return (
    <Stack
      direction='column'
      spacing={2}
      sx={{
        width: '100%',
        maxWidth: STYLE.width.desktop,
        height: '100%',
        px: 2,
        pb: 2,
        mx: 'auto',
      }}
    >
      <RequestConnectionHandler />
      <DefaultHeaderShim />
      <Stack
        direction='row'
        spacing={2}
        sx={{ width: '100%' }}
        useFlexGap
        flexWrap='wrap'
      >
        <SelfPeer />
        <PeerConnections />
      </Stack>
      <MessageViewer />
      <MessageEditor />
    </Stack>
  )
}
