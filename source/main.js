import { World } from './app/world'

import { CIRCUIT_MODEL } from './lib/constants'
import { CircuitScene } from './scenes/circuit'

// Create the scene and the world.
const scene = new CircuitScene()
const world = new World(scene)

// Set the initial camera position and set up the scene.
world.mainCamera.position.set(165, 55, 280)
await scene.initialize()

// Load the circuit model and start the animation loop for the world.
await world.loadGLTF(CIRCUIT_MODEL)
document.getElementById('overlay').classList.add('hidden')

world.start((time, delta) => {

	scene.update(time, delta)
})