import type { ShDir, ShFile } from './ShAsset'

interface ShRouterRegisterCallback {
  (props: { path: string; type: 'dir' | 'file' }): Promise<ShDir | ShFile>
}

export class ShRouter {
  routes: Record<string, ShRouterRegisterCallback> = {}

  register(routeHash: string, callback: ShRouterRegisterCallback) {
    this.routes[routeHash] = callback
  }

  generate(
    routeHash: string,
    props: { path: string; type: 'file' }
  ): Promise<ShFile>
  generate(
    routeHash: string,
    props: { path: string; type: 'dir' }
  ): Promise<ShDir>
  generate(routeHash: string, props: { path: string; type: 'dir' | 'file' }) {
    const route = this.routes[routeHash]
    if (!route) {
      throw new Error(`Route not found: ${routeHash}`)
    }
    return route({ ...props, type: 'dir' })
  }
}
