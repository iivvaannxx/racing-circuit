import * as Three from 'three'
import { fetchJson } from 'fetch-json'

import { BLENDER_SCALE } from '../lib/constants'

/** Represents a path in the circuit. */
export class CircuitPath {

  /**
   * Creates a new CircuitPath instance.
   * 
   * @param {string} dataFilePath - The path to the JSON file containing the circuit path data.
   * @param {number} tStart - The starting point of the circuit path.
  */

  constructor (dataFilePath, tStart) {

    this.dataFilePath = dataFilePath
    this.tStart = tStart

    /** @type {THREE.Vector3[]} */
    this.points = []
  }

  /**
   * Loads the circuit path data.
   * @param {number} [scale=BLENDER_SCALE] - The scale to apply to the circuit path data.
  */

  async load (scale = BLENDER_SCALE) {

    const points = await fetchJson.get(this.dataFilePath)
    this.points = points.map(point => {
      
      const [x, y, z] = point
      const points = new Three.Vector3(x, z, -y)

      return points.multiplyScalar(scale)
    })

    this.curve = new Three.CatmullRomCurve3(this.points, true)

    const curvePoints = this.curve.getPoints(this.points.length)
    this.geometry = new Three.BufferGeometry().setFromPoints(curvePoints)
  }

  /**
   * Remaps the given t value to the circuit path.
   * @param {number} t - The t value to remap.
  */

  remapT (t) {

    // Curve points go from 0 to 1, but we want to start at tStart.
    // Also they are inversed (1 is the start, 0 is the end), so we need to invert them.

    const inverted = 1 - t
    return (this.tStart + inverted) % 1
  }

  /**
   * Gets the point on the circuit path at the given t value.
   * @param {number} t - The t value to get the point for.
  */

  getPoint (t) {

    const remapped = this.remapT(t)
    return this.curve.getPointAt(remapped)
  }

  /**
   * Gets the rotation matrix for the circuit path at the given t value.
   * @param {number} t - The t value to get the rotation matrix for.
  */

  getRotation (t) {

    const remapped = this.remapT(t)
    const point = this.curve.getPointAt(remapped)
    const tangent = this.curve.getTangentAt(remapped).normalize()

    const target = point.clone().add(tangent)
    const rotationMatrix = new Three.Matrix4()

    // Orient to look at 'target' from 'point', using 'axis' as the up direction.
    return rotationMatrix.lookAt(point, target, new Three.Vector3(0, 1, 0))
  }

  /**
   * Places the given model on the circuit path at the given t value.
   * 
   * @param {THREE.Object3D} model - The model to place on the circuit path.
   * @param {number} t - The t value to place the model at.
  */

  placeModel (model, t) {

    const point = this.getPoint(t)
    model.position.copy(point)

    const rotationMatrix = this.getRotation(t)
    model.setRotationFromMatrix(rotationMatrix)
  
  }

  /**
   * Gets a debug line to visualize the circuit path.
   * @param {THREE.Material} material - The material to use for the debug line.
  */

  getDebugLine (material) {

    const line = new Three.Line(this.geometry, material)
    line.position.y += 0.15

    return line
  }
}