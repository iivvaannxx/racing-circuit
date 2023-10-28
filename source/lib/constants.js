import * as Three from 'three'

/** The coordinate origin of any scene. */
export const ORIGIN = new Three.Vector3(0, 0, 0)

/** The scale to be applied from Blender models. */
export const BLENDER_SCALE = 10

/** The path to the circuit model. */
export const CIRCUIT_MODEL = '/models/Circuit.glb'

/** The path to the ground texture. */
export const GROUND_TEXTURE = '/textures/ground.png'

/** The default speed of the cars. */
export const DEFAULT_CAR_SPEED = 50

/** The data for the 'Car 1' model. */
export const CAR_1_DATA = {

  name: 'Coche 1',
  filePath: '/models/Car 1.glb',
  materialName: 'yellow'
}

/** The data for the 'Car 2' model. */
export const CAR_2_DATA = {
 
  name: 'Coche 2',
  filePath: '/models/Car 2.glb',
  materialName: 'red.054'
}

/** The data relative to the 'Path 1' of the circuit. */
export const PATH_1 = {

  dataFilePath: '/data/path-1.json',
  tStart: 0.1432
}

/** The data relative to the 'Path 2' of the circuit. */
export const PATH_2 = {

  dataFilePath: '/data/path-2.json',
  tStart: 0.8581
}

/** The configuration for the sun. */
export const SUN_CONFIG = {

  initialElevation: 20,
  initialRotation: -150,

  cycleDuration: 3 // Minutes
}

/** The position offset to apply when following the cars. */
export const FOLLOW_CAMERA_OFFSET = new Three.Vector3(0, 5, -10)
