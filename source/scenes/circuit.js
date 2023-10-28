import * as Three from 'three'

import { Car } from '../app/car'
import { World } from '../app/world'
import { AnimatedSky } from '../app/sky'
import { CircuitPath } from '../app/path'

import { button, checkbox, dropdown, folder } from '../lib/gui'
import { 
  
  CAR_1_DATA, CAR_2_DATA, 
  DEFAULT_CAR_SPEED, 
  FOLLOW_CAMERA_OFFSET, 
  GROUND_TEXTURE, 

  PATH_1, PATH_2, 
  SUN_CONFIG 

} from '../lib/constants'


/** Represents the scene of the racing circuit. */
export class CircuitScene extends Three.Scene {

  /** Creates a new instance of the scene. */
  constructor () {

    super()

    this.sky = new AnimatedSky({ ...SUN_CONFIG })

    // Create the paths of the circuit.
    this.path1 = new CircuitPath(PATH_1.dataFilePath, PATH_1.tStart)
    this.path2 = new CircuitPath(PATH_2.dataFilePath, PATH_2.tStart)

    // Create the cars and bind each to a different path.
    this.car1 = new Car(CAR_1_DATA, this.path1)
    this.car2 = new Car(CAR_2_DATA, this.path2)

    this.guiFolder = folder('Scene')
    this.target = null

    this.helpers = [

      new Three.AxesHelper(Number.MAX_SAFE_INTEGER),
      new Three.CameraHelper(this.sky.sunLight.shadow.camera),
    ]
  }

  /** Initializes the scene by loading all the necessary assets and adding them to the scene. */
  async initialize () {

    // Wait for everything to be loaded.
    await this.path1.load()
    await this.path2.load()
    await this.car1.load()
    await this.car2.load()

    // Add the cars to the scene.
    this.add(this.car1.model)
    this.add(this.car2.model)
    this.add(this.sky)
    this.add(this.sky.sunLight)

    this.sky.startCycle()
    this.addGround()
    this.addLighting()

    this.fog = new Three.Fog(0xeeeeee, 0.1, 10000)
    this.createUI()

    this.helpers.push(

      this.path1.getDebugLine(new Three.MeshBasicMaterial({ color: 0x0000ff })),
      this.path2.getDebugLine(new Three.MeshBasicMaterial({ color: 0xff0000 }))
    )
  }

  /**
   * Adds an infinite plane to serve as the ground.
   * 
   * @param {number} [size=30000] - The size of the plane.
   * @param {number} [color=0xf8ecd4] - The color of the plane.
  */

  addGround(size = 30000) {

    const texture = new Three.TextureLoader().load(GROUND_TEXTURE)

    // Configure the texture
    texture.wrapS = Three.RepeatWrapping;
    texture.wrapT = Three.RepeatWrapping;
    texture.repeat.set(100, 100)

    // Add an infinite plane to serve as the ground.
    this.ground = new Three.Mesh(
  
      new Three.PlaneGeometry(size, size),
      new Three.MeshStandardMaterial({ map: texture, color: 0xe5bfee })
    )
  
    // Make it visible from downside.
    this.ground.material.side = Three.DoubleSide
  
    // Slightly offset it and rotate it so it's horizontal.
    this.ground.position.y = -0.025
    this.ground.rotation.x = -Math.PI / 2
  
    // Enable shadows for the ground.
    this.ground.receiveShadow = true
    this.add(this.ground)
  }
  
  /** Adds lighting to the scene. */
  addLighting () {

    const hemisphereLight = new Three.HemisphereLight('skyblue', 'darkslategrey', 0.5)
    const ambientLight = new Three.AmbientLight(0xbbbbbb, 1)
    ambientLight.position.y = 1000

    this.add(hemisphereLight)
    this.add(ambientLight)
  }

  /**
   * Updates the scene.
   * 
   * @param {number} time - The current time.
   * @param {number} delta - The time elapsed since the last update.
  */

  update (time, delta) {

    this.car1.update(delta)
    this.car2.update(delta)

    World.instance.mainCamera.followTarget(this.target, FOLLOW_CAMERA_OFFSET, new Three.Vector3(0, 0, 0))
  }

  /** Creates the UI for the scene. */
  createUI () {

    const carMap = {

      "Free": null,
      "Car 1": this.car1.model,
      "Car 2": this.car2.model
    }

    checkbox('Depurar', false, (value) => this.toggleHelpers(value), this.guiFolder)
    dropdown('Camera', ["Free", "Car 1", "Car 2"], "Free", (value) => {

      const camera = World.instance.mainCamera
      const newTarget = carMap[value]

      // The camera is in free mode and it's about to change.
      if (this.target === null) {

        camera.controls.saveState()
      }

      // Thew new camera mode is the free mode.
      if (newTarget === null) {

        camera.controls.reset()
      }

      // Disable the camera controls if the camera is following a car.
      this.target = newTarget
      camera.controls.enabled = newTarget === null

    }, this.guiFolder)

    button('Race!', () => {

      this.prepareCarForRace(this.car1)
      this.prepareCarForRace(this.car2)

    }, this.guiFolder)
  }

  /**
   * Toggles the helpers for the circuit and the cars.
   * @param {boolean} enable - Whether to enable or disable the helpers.
  */

  toggleHelpers(enable) {

    const action = enable ? this.add : this.remove
    this.helpers.forEach(helper => action.call(this, helper))

    this.car1.toggleHelper(enable)
    this.car2.toggleHelper(enable)
  }


  /**
   * Prepares a car for the race by setting its initial position and speed.
   * @param {Car} car - The car to prepare for the race.
  */

  prepareCarForRace(car) {

    car.moveTo(0)
    car.onLapCompleted = () => {

      alert(`El ganador es el ${car.name}!`)

      // Reset both cars.
      this.resetCar(this.car1)
      this.resetCar(this.car2)
    }

    // Assign a random speed.
    car.speed = Three.MathUtils.randInt(45, 75)
    car.shouldMoveAlone = true
  }

  /**
   * Resets the given car to its default state.
   * @param {Car} car - The car to reset.
  */
 
  resetCar(car) {

    car.moveTo(0)
    car.onLapCompleted = null
    car.speed = DEFAULT_CAR_SPEED
    car.shouldMoveAlone = false
  }
}