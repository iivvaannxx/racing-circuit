import * as Three from 'three'
import * as Tween from '@tweenjs/tween.js'
import Stats from 'three/examples/jsm/libs/stats.module'

import { Camera } from './camera'
import { BLENDER_SCALE } from '../lib/constants'
import { assertWebGLAvailable, loadModel } from '../lib/utils'

/** Represents the world in which the game takes place. */
export class World {

  /**
   * The singleton instance of the world object.
   * @type {World}
  */

  static instance = null

  /**
   * Constructs a new instance of a world.
   * @param {Three.Scene|null} [scene=null] - The scene to be used for the world.
  */

  constructor (scene = null) {

    if (World.instance) {
      
      return World.instance
    }
    
    // Ensure WebGL is available.
    assertWebGLAvailable()
    this.initializeRenderer()

    // Set the singleton instance.
    World.instance = this

    // Create the initial scene.
    this.currentScene = scene ?? new Three.Scene()
    this.initializeStats()

    this.mainCamera = new Camera(window.innerWidth / window.innerHeight, 300)
    window.addEventListener('resize', this.mainCamera.resizeHandler)

  }

  /** Initializes the renderer used to render the world. */
  initializeRenderer() {

    this.renderer = new Three.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true })
    document.body.appendChild(this.renderer.domElement)

    // Set it full-screen.
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.autoClear = false

    // Enable shadows.
    this.renderer.shadowMap.enabled = true
  }

  /** Initializes the stats counters used to monitor the world. */
  initializeStats() {

    // FPS counter.
    this.fps = new Stats()
    this.fps.showPanel(0)
    
    // Memory usage.
    this.memory = new Stats()
    this.memory.showPanel(2)
    this.memory.dom.style.top = '48px'

    // Add the stats to the page.
    document.body.appendChild(this.fps.dom)
    document.body.appendChild(this.memory.dom)
  }

  /**
   * Updates the internal state of the world.
   * @param {number} time - The current time in milliseconds.
  */

  updateInternal (time) {

    // Clear the scene.
    this.renderer.clear()

    // Update the stats.
    this.fps.update()
    this.memory.update()

    Tween.update(time)
  }

  /**
   * Starts the game loop.
   * @param {(time: number, delta: number) => void} onUpdate - The function to be called on each update.
  */

  start (onUpdate) {

    this.previousTime = 0
    this.onUpdate = onUpdate

    this.#animate(0, 0)
  }

  /**
   * Runs the main animation loop.
   * @param {number} time - The current time in milliseconds.
  */

  #animate (time) {

    this.updateInternal(time)
  
    // Calculate the new delta.
    const delta = (time - this.previousTime) / 1000
    this.previousTime = time

    // Invoke the main update loop.
    this.mainCamera.controls.update(delta)
    this.onUpdate(time, delta)

    // Render the scene.
    this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight)
    this.renderer.render(this.currentScene, this.mainCamera)

    requestAnimationFrame((time) => this.#animate(time))
  }

  /**
   * Adds the given objects to the current scene of the world.
   * @param {THREE.Object3D[]} objects - The objects to be added to the scene.
  */

  add (...objects) {

    this.currentScene.add(...objects)
  }

  /**
   * Loads a GLTF model from the specified file path and adds it to the scene.
   * 
   * @param {string} filePath - The file path of the GLTF model to load.
   * @param {number} [initialScale=BLENDER_SCALE] - The initial scale of the loaded model.
   * @returns {Promise<THREE.Object3D>} The loaded object.
  */

  async loadGLTF (filePath, initialScale = BLENDER_SCALE) {

    const model = await loadModel(filePath, initialScale)

    this.add(model)
    return model
  }
}