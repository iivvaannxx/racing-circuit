import * as Three from 'three'

import { Car } from '../app/car'
import { World } from '../app/world'
import { AnimatedSky } from '../app/sky'
import { CircuitPath } from '../app/path'

import { button, checkbox, dropdown, folder } from '../lib/gui'
import { 
  
  CAR_1_DATA, CAR_2_DATA, 
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

    this.guiFolder = folder('Escena')
    this.target = null

    this.racing = false
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
    this.ground.position.y = -0.01
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

    const carNames = [this.car1.name, this.car2.name]
    const carMap = {

      "Libre": null,
      [this.car1.name]: this.car1.model,
      [this.car2.name]: this.car2.model
    }

    checkbox('Depurar', false, (value) => this.toggleHelpers(value), this.guiFolder)
    dropdown('Camera', ["Libre", ...carNames], "Libre", (value) => {

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

    this.raceButton = button('Carrera!', () => this.prepareRace(), this.guiFolder)
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

  /** Prepares a race between the cars of the scene. */
  prepareRace() {

    if (!(this.racing)) {

      this.racing = true

      this.raceButton.disable()
      this.raceButton.$button.innerText = "Carrera en Curso"
      this.raceButton.$button.style.backgroundColor = 'rgba(255, 0, 0, 0.4)'

      const onRaceFinished = (winnerName) => {

        this.racing = false

        this.raceButton.enable()
        this.raceButton.$button.innerText = "Carrera!"
        this.raceButton.$button.style.backgroundColor = ''

        // Announce the winner.
        this.sky.animateCycle.setValue(false)
        alert(`El ganador es el ${winnerName}!`)     
        this.sky.animateCycle.setValue(true)

        this.car1.reset()
        this.car2.reset()
      }

      this.car1.prepareRace(onRaceFinished)
      this.car2.prepareRace(onRaceFinished)
    }
  }
}