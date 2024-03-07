'use client'

import { SelfPeer } from './SelfPeer'
import { PeerConnections } from './PeerConnections'
import { RequestConnectionHandler } from './RequestConnectionHandler'
import { MessageEditor } from './MessageEditor'
import { MessageViewer } from './MessageViewer'

import { Stack } from '@mui/material'

export function PeerClient() {
  return (
    <>
      <Stack
        spacing={2}
        direction='row'
        justifyContent='flex-start'
        alignItems='center'
        useFlexGap
        flexWrap='wrap'
      >
        <SelfPeer />
        <PeerConnections />
        <MessageViewer />
        <MessageEditor />
      </Stack>
      <RequestConnectionHandler />
    </>
  )
}
