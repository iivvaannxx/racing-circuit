import * as Three from 'three'

import { loadModel } from '../lib/utils'
import { CircuitPath } from './path'

import { DEFAULT_CAR_SPEED } from '../lib/constants'
import { checkbox, color, folder, slider } from '../lib/gui'

/** Represents a car in the racing circuit. */
export class Car {

  /**
   * Creates a new Car instance.
   * @param {Object} options - The options for the car.
   * @param {string} options.name - The name of the car.
   * @param {string} options.materialName - The name of the material used for the car.
   * @param {string} options.filePath - The file path of the car model.
   * @param {CircuitPath} circuitPath - The circuit path this car is going to follow.
  */

  constructor ({ name, materialName, filePath }, circuitPath) {

    this.name = name
    this.materialName = materialName
    this.filePath = filePath
    this.circuitPath = circuitPath

    this.shouldMoveAlone = false
    this.model = null
    this.position = 0
    
    /** @type {THREE.MeshStandardMaterial} */
    this.material = null
    this.guiFolder = folder(this.name)
    this.helper = new Three.AxesHelper(2)
    this.speed = DEFAULT_CAR_SPEED

    this.onLapCompleted = null
  }

  /** Loads the car model and curve data into the scene. */
  async load () {

    // Load the model and place it at its initial position.
    this.model = await loadModel(this.filePath)
    this.moveTo(0)

    // Find the material for the color of the car.
    this.model.traverse((child) => {

      if (child.isMesh && child.material.name === this.materialName) {

        this.material = child.material
      }
    })

    this.createUI()
  }

  /**
   * Updates the car's position and rotation.
   * @param {number} delta - The time elapsed since the last update.
  */

  update (delta) {

    if (this.shouldMoveAlone) {

      // Move along the curve.
      this.position += (this.speed * delta) / 500

      if (this.position > 1) {

        this.onLapCompleted?.()
        this.position -= 1
      }
    }

    this.moveTo(this.position)
  }

  /**
   * Moves the car to a specific position on the curve.
   * @param {number} t - The position on the curve (0-1).
  */

  moveTo (t) {

    this.position = Math.min(1, Math.max(0, t))
    this.positionSlider?.setValue(this.position)

    // Move along the curve on 't' and adjust the wheels.
    this.circuitPath.placeModel(this.model, this.position)
    this.model.position.y += 0.8
  }

  /** Creates the user interface for the car. */
  createUI () {

    const carColor = this.material.color.getHexString()

    this.moveCheckbox = checkbox('Mover', this.shouldMoveAlone, (value) => { this.shouldMoveAlone = value }, this.guiFolder)
    this.colorSelector = color('Color', carColor, (value) => { this.material.color.set(value) }, this.guiFolder)
    this.positionSlider = slider('Posición', this.position, [0, 1, 0.001], (value) => {

      this.position = value

    }, this.guiFolder)
  }

  /**
   * Toggles the helper for the car model.
   * @param {boolean} enable - Whether to enable or disable the helper.
  */

  toggleHelper (enable) {

    const action = enable ? this.model.add : this.model.remove
    action.call(this.model, this.helper)
  }

  /**
   * Prepares the car for a race.
   * @param {(winner: string) => void} onRaceFinished - The function to be called when the race is finished.
  */

  prepareRace (onRaceFinished) {

    this.moveTo(0)
    this.onLapCompleted = () => onRaceFinished(this.name)

    this.speed = Three.MathUtils.randInt(45, 75)
    this.moveCheckbox.setValue(true)
    this.moveCheckbox.disable()
    this.positionSlider.disable()
  }

  /** Resets the car to its initial state. */
  reset () {

    this.moveTo(0)

    this.moveCheckbox.setValue(false)
    this.moveCheckbox.enable()
    this.positionSlider.enable()

    this.onLapCompleted = null
    this.speed = DEFAULT_CAR_SPEED
  }
}
