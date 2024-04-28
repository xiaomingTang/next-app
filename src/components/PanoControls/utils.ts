import { clamp } from 'lodash-es'
import { Spherical, Vector3, type PerspectiveCamera } from 'three'

export const EPS = 0.00001

/**
 * means "is valid number"
 */
function vn(v?: number): v is number {
  return typeof v === 'number' && !Number.isNaN(v)
}

export function formatView<
  T extends {
    h?: number
    v?: number
    fov?: number
  },
>({ h, v, fov }: T): T {
  const newH = !vn(h) ? undefined : ((h % 360) + 360) % 360
  const newV = !vn(v)
    ? undefined
    : clamp(((v % 180) + 180) % 180, EPS, 180 - EPS)
  const newFov = !vn(fov)
    ? undefined
    : clamp(((fov % 180) + 180) % 180, EPS, 180 - EPS)
  return {
    h: newH,
    v: newV,
    fov: newFov,
  } as T
}

const gWorldDirection = new Vector3()
const gSpherical = new Spherical()

export function getRotationFrom(camera: PerspectiveCamera) {
  camera.getWorldDirection(gWorldDirection)
  gSpherical.setFromVector3(gWorldDirection)
  return formatView({
    h: (gSpherical.theta / Math.PI) * 180,
    v: (gSpherical.phi / Math.PI) * 180,
  })
}

const uWorldDirection = new Vector3()
const uTarget = new Vector3()
const uSpherical = new Spherical()

export function updateCamera(
  camera: PerspectiveCamera,
  config: {
    /**
     * in degrees, 0 ~ 360
     */
    h?: number
    /**
     * in degrees, EPS ~ (180 - EPS)
     */
    v?: number
    /**
     * in degrees, EPS ~ (180 - EPS)
     */
    fov?: number
  }
) {
  const { h, v, fov } = formatView(config)
  if (!vn(fov) && !vn(h) && !vn(v)) {
    return
  }
  if (vn(fov)) {
    camera.fov = fov
  }
  if (vn(h) || vn(v)) {
    camera.getWorldDirection(uWorldDirection)
    uSpherical.setFromVector3(uWorldDirection)
    if (vn(h)) {
      uSpherical.theta = (h / 180) * Math.PI
    }
    if (vn(v)) {
      uSpherical.phi = (v / 180) * Math.PI
    }
    uTarget.setFromSpherical(uSpherical).add(camera.position)
    camera.lookAt(uTarget)
  }
  camera.updateProjectionMatrix()
}
