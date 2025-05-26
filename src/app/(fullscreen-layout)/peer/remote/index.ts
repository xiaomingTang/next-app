import { toError } from '@/errors/utils'

import EventEmitter from 'eventemitter3'
import { isRemoteAdaptorData, Remote } from '@zimi/remote'
import { withStatic } from '@zimi/utils'

import type { DataConnection } from 'peerjs'
import type Peer from 'peerjs'
import type { Adaptor, AdaptorPackageData } from '@zimi/remote'

class RemoteEventManager extends EventEmitter<{
  [key: string]: [AdaptorPackageData]
}> {
  EVERY_EVENT_NAME = '__remote_every__'

  peer: Peer | null = null

  connections: Record<string, DataConnection> = {}

  defaultConnectionId: string | null = null

  setConnection(conn: DataConnection) {
    return new Promise<void>((resolve, reject) => {
      conn.on('open', () => {
        this.connections[conn.peer] = conn
        resolve()
      })
      conn.on('error', (err) => {
        console.error(`Connection error with peer ${conn.peer}:`, err)
        reject(toError(err))
      })
      conn.on('close', () => {
        console.warn(`Connection with peer ${conn.peer} closed.`)
        delete this.connections[conn.peer]
        reject(new Error(`Connection with peer ${conn.peer} closed.`))
      })
    })
  }

  setPeer(peer: Peer) {
    if (this.peer) {
      return
    }
    this.peer = peer
    return new Promise<void>((resolve, reject) => {
      peer.on('open', () => {
        peer.on('connection', (conn) => {
          conn.on('data', (data) => {
            if (isRemoteAdaptorData(data)) {
              this.emit(data.name, data)
              // 一定要抛出 every 事件，remote 包基于此处理远端的响应
              this.emit(this.EVERY_EVENT_NAME, data)
            }
          })
        })
        resolve()
      })
      peer.on('error', (err) => {
        console.error('Peer connection error:', err)
        reject(toError(err))
      })
      peer.on('close', () => {
        console.warn('Peer connection closed.')
        this.peer = null
        this.connections = {}
        reject(new Error('Peer connection closed.'))
      })
    })
  }

  onEvery(fn: (data: AdaptorPackageData) => void) {
    this.on(this.EVERY_EVENT_NAME, fn)
  }

  onEmit(data: AdaptorPackageData) {
    if (!this.peer) {
      throw new Error('Peer connection is not established.')
    }
    if (!this.peer.open) {
      throw new Error('Peer connection is not open.')
    }
    const dataWithId: AdaptorPackageData = {
      ...data,
      targetDeviceId: data.targetDeviceId || this.defaultConnectionId || '',
    }
    const conn = this.connections[dataWithId.targetDeviceId]
    if (!conn) {
      throw new Error(
        `No connection found for device ID: ${dataWithId.targetDeviceId}`
      )
    }
    if (!conn.open) {
      throw new Error(
        `Connection to device ID ${dataWithId.targetDeviceId} is not open.`
      )
    }
    void conn.send(dataWithId)
  }
}

const remoteEventManager = new RemoteEventManager()

const adaptor: Adaptor = {
  every: remoteEventManager.onEvery.bind(remoteEventManager),
  on: remoteEventManager.on.bind(remoteEventManager),
  once: remoteEventManager.once.bind(remoteEventManager),
  off: remoteEventManager.off.bind(remoteEventManager),
  emit: remoteEventManager.onEmit.bind(remoteEventManager),
}

const rawRemote = new Remote<FuncsFromPeer, FuncsFromPeer>(adaptor, {
  debug: true,
})

export const remote = withStatic(rawRemote, {
  get connections() {
    return remoteEventManager.connections
  },
  setPeer: (peer: Peer) => {
    rawRemote.deviceId = peer.id || ''
    return remoteEventManager.setPeer(peer)
  },
  setConnection: (conn: DataConnection) => {
    return remoteEventManager.setConnection(conn)
  },
  setDefaultConnectionId: (id: string | null) => {
    remoteEventManager.defaultConnectionId = id
  },
})
