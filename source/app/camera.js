import * as Three from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { ORIGIN } from '../lib/constants'
import { World } from './world'

/** A class representing a prespective camera in a 3D scene. */
export class Camera extends Three.PerspectiveCamera {

  /**
   * Creates a new Camera instance.
   * 
   * @param {number} aspectRatio - The aspect ratio of the camera.
   * @param {number} radius - The distance of the camera from the origin.
   * @param {number} [fov=75] - The field of view of the camera.
   * @param {number} [near=3] - The near clipping plane of the camera.
   * @param {number} [far=10000] - The far clipping plane of the camera.
  */

  constructor (aspectRatio, radius, fov = 75, near = 3, far = 10000) {

    super(fov, aspectRatio, near, far)

    // Create the camera and position it at the given distance.
    this.position.set(radius, radius, radius)
    this.lookAt(ORIGIN)

    this.controls = Camera.createControls(this, World.instance.renderer)
    this.resizeHandler = Camera.createOnWindowResizeHandler(this, World.instance.renderer)
    this.target = null
  }

  /**
   * Positions the camera to follow a target object.
   * 
   * @param {Three.Object3D} target - The target object to follow.
   * @param {Three.Vector3} positionOffset - The offset of the camera position from the target position.
   * @param {Three.Vector3} rotationOffset - The offset of the camera rotation from the target rotation.
  */

  followTarget (target, positionOffset, rotationOffset) {

    if (target) {

      // Start with the target's position
      const targetPosition = target.position.clone();
      
      // Apply the rotation of the target to the position offset
      const rotatedOffset = positionOffset.clone().applyQuaternion(target.quaternion);
      
      // Add the rotated offset to the target position
      this.position.copy(targetPosition).add(rotatedOffset);
    
      // Get world direction of the target
      const worldDirection = new Three.Vector3();
      target.getWorldDirection(worldDirection);

      // Make this object look in the same world direction as the target
      const lookAt = new Three.Vector3();
      lookAt.copy(target.position).add(worldDirection);
    
      // Apply rotation offset
      lookAt.add(rotationOffset);
      this.lookAt(lookAt);
    }
  }

  /**
   * Creates and returns a new instance of OrbitControls for the given camera.
   * 
   * @param {PerspectiveCamera} camera - The camera to attach the controls to.
   * @param {WebGLRenderer} renderer - The renderer to use for the controls.
   * @param {WebGLRenderer} maxPolarAngle - The maximum angle of the vertical orbit.
  */

  static createControls (camera, renderer, maxPolarAngle = 85) {

    // Create the orbit controls by default.
    const controls = new OrbitControls(camera, renderer.domElement)
  
    controls.target = ORIGIN
    controls.enableDamping = true
    controls.zoomToCursor = true
  
    // Limit the vertical orbiting angle and the zoom.
    controls.maxPolarAngle = Three.MathUtils.degToRad(maxPolarAngle)
    controls.maxDistance = camera.far / 2
  
    controls.update()
    return controls
  }

  /**
   * Creates a handler function to update the camera and renderer on window resize.
   * 
   * @param {THREE.Camera} camera - The camera to update.
   * @param {THREE.WebGLRenderer} renderer - The renderer to update.
  */

  static createOnWindowResizeHandler (camera, renderer) {

    return () => {

      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
  }
}
