'use client'

import { SelfPeer } from './components/SelfPeer'
import { PeerConnections } from './components/PeerConnections'
import { RequestConnectionHandler } from './components/RequestConnectionHandler'

import { Stack } from '@mui/material'

export function PeerClient() {
  return (
    <>
      <Stack
        spacing={2}
        direction='row'
        justifyContent='center'
        alignItems='center'
        useFlexGap
        flexWrap='wrap'
      >
        <SelfPeer />
        <PeerConnections />
      </Stack>
      <RequestConnectionHandler />
    </>
  )
}
