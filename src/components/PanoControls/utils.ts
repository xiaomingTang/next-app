import { clamp } from 'lodash-es'
import { Spherical, Vector3, type PerspectiveCamera } from 'three'

export const EPS = 0.00001
export const PI_2 = Math.PI * 2

/**
 * means "is valid number"
 */
function vn(v?: number): v is number {
  return typeof v === 'number' && !Number.isNaN(v)
}

const gWorldDirection = new Vector3()
const gSpherical = new Spherical()

export function getRotationFrom(camera: PerspectiveCamera) {
  camera.getWorldDirection(gWorldDirection)
  gSpherical.setFromVector3(gWorldDirection)
  return {
    h: gSpherical.theta,
    v: gSpherical.phi,
  }
}

const uWorldDirection = new Vector3()
const uTarget = new Vector3()
const uSpherical = new Spherical()

export function updateCamera(
  camera: PerspectiveCamera,
  {
    h,
    v,
    fov,
  }: {
    /**
     * in rad, 0 ~ 2PI
     */
    h?: number
    /**
     * in rad, EPS ~ (PI - EPS)
     */
    v?: number
    /**
     * in degrees, EPS ~ (180 - EPS)
     */
    fov?: number
  }
) {
  if (!vn(fov) && !vn(h) && !vn(v)) {
    return
  }
  if (vn(fov)) {
    camera.fov = clamp(fov, EPS, 180 - EPS)
  }
  if (vn(h) || vn(v)) {
    camera.getWorldDirection(uWorldDirection)
    uSpherical.setFromVector3(uWorldDirection)
    if (vn(h)) {
      uSpherical.theta = ((h % PI_2) + PI_2) % PI_2
    }
    if (vn(v)) {
      uSpherical.phi = clamp(v, EPS, Math.PI - EPS)
    }
    uTarget.setFromSpherical(uSpherical).add(camera.position)
    camera.lookAt(uTarget)
  }
  camera.updateProjectionMatrix()
}
