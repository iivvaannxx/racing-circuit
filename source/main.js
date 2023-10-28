import { World } from './app/world'

import { CIRCUIT_MODEL, PATH_1 } from './lib/constants'
import { CircuitScene } from './scenes/circuit'
import { CircuitPath } from './app/path'

// Create the scene and the world.
const scene = new CircuitScene()
const world = new World(scene)

// Set the initial camera position and set up the scene.
world.mainCamera.position.set(165, 55, 280)
await scene.initialize()

const path = new CircuitPath(PATH_1.dataFilePath, PATH_1.tStart)
await path.load()

// Load the circuit model and start the animation loop for the world.
world.loadGLTF(CIRCUIT_MODEL)
world.start((time, delta) => {

	scene.update(time, delta)
})