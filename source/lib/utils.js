import WebGL from 'three/examples/jsm/capabilities/WebGL.js'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { BLENDER_SCALE } from './constants'

/**
 * Checks if WebGL is available in the current browser and throws an error if not.
 * @throws {Error} If WebGL is not available in the current browser.
*/

export function assertWebGLAvailable() {

  // If the current browser is not supported.
  if (!(WebGL.isWebGLAvailable())) {

    // Show an error if not compatible.
    const error = WebGL.getWebGLErrorMessage()
    document.body.appendChild(error)

    throw new Error(error)
  }
}

/**
 * Loads a 3D model from the specified path using GLTFLoader.
 * 
 * @param {string} path - The path to the 3D model.
 * @param {number} initialScale - The initial scale to apply to the model.
 * @returns {Promise<THREE.Object3D>} - A Promise that resolves with the loaded model.
*/

export async function loadModel (path, initialScale = BLENDER_SCALE) {

  const loader = new GLTFLoader()

  // Load the model and initialize it.
  const { scene } = await loader.loadAsync(path)
  scene.scale.multiplyScalar(initialScale)

  // Enable shadows for all meshes in the model.
  scene.traverse((child) => {

    if (child.isMesh) {

      child.castShadow = true
      child.receiveShadow = true
    }
  })

  return scene
}