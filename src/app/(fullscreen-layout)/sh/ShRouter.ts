import type { ShDir, ShFile } from './ShAsset'

interface ShRouterRegisterCallback<Ctx> {
  (props: { path: string; type: 'dir' | 'file'; ctx: Ctx }): ShDir | ShFile
}

export class ShRouter<Ctx> {
  routes: Record<string, ShRouterRegisterCallback<Ctx>> = {}

  register(routeHash: string, callback: ShRouterRegisterCallback<Ctx>) {
    this.routes[routeHash] = callback
  }

  generate(
    routeHash: string,
    props: { path: string; type: 'file'; ctx: Ctx }
  ): ShFile
  generate(
    routeHash: string,
    props: { path: string; type: 'dir'; ctx: Ctx }
  ): ShDir
  generate(
    routeHash: string,
    props: { path: string; type: 'dir' | 'file'; ctx: Ctx }
  ) {
    const route = this.routes[routeHash]
    if (!route) {
      throw new Error(`Route not found: ${routeHash}`)
    }
    return route(props)
  }
}
