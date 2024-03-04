'use client'

import { SelfPeer } from './components/SelfPeer'
import { PeerConnections } from './components/PeerConnections'
import { RequestConnectionHandler } from './components/RequestConnectionHandler'
import { MessageEditor } from './components/MessageEditor'

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
        <MessageEditor />
      </Stack>
      <RequestConnectionHandler />
    </>
  )
}
