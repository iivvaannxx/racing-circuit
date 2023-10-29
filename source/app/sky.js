import * as Three from 'three'
import { Sky } from 'three/examples/jsm/objects/Sky'
import { Tween } from '@tweenjs/tween.js'

import { checkbox, folder, slider } from '../lib/gui'

/** Represents a sky with an animatable sun light. */
export class AnimatedSky extends Sky {

  /**
   * Constructor for AnimatedSky class.
   * @param {Object} options - Options object.
   * @param {number} options.initialElevation - Initial elevation of the sun.
   * @param {number} options.initialRotation - Initial rotation of the sun.
   * @param {number} [options.sunLightColor=0xdddddd] - Color of the sun light.
   * @param {number} [options.sunLightIntensity=10] - Intensity of the sun light.
   * @param {number} [options.cycleDuration=3] - Duration of the sun cycle in minutes.
   * @param {number} [options.scale=50000] - Scale of the sky.
   * @param {number} [options.turbidity=2.5] - Turbidity of the sky.
   * @param {number} [options.rayleigh=0.35] - Rayleigh of the sky.
   * @param {number} [options.mieCoefficient=0.001] - Mie coefficient of the sky.
   * @param {number} [options.mieDirectionalG=0.999] - Mie directional G of the sky.
  */
 
  constructor ({ 
    
    initialElevation, 
    initialRotation,

    sunLightColor = 0xdddddd,
    sunLightIntensity = 10,
    cycleDuration = 3,
    
    scale = 50000, turbidity = 2.5, rayleigh = 0.35, 
    mieCoefficient = 0.001, mieDirectionalG = 0.999 

  }) {

    // See: https://github.com/mrdoob/three.js/blob/dev/examples/webgl_shaders_sky.html
    super()

    this.sunPosition = new Three.Vector3()
    this.sunLight = new Three.DirectionalLight(sunLightColor, sunLightIntensity)
    
    this.cycleDuration = cycleDuration * 60 * 1000
    this.sunElevation = initialElevation
    this.sunRotation = initialRotation
    this.scale.setScalar(scale)

    // Arbitrary but fine-tuned values.
    const uniforms = this.material.uniforms
    uniforms.turbidity.value = turbidity
    uniforms.rayleigh.value = rayleigh
    uniforms.mieCoefficient.value = mieCoefficient
    uniforms.mieDirectionalG.value = mieDirectionalG

    // Calculate the initial sun position.
    this.initializeSun()

    // Create the tweens and the UI folder.
    this.guiFolder = folder('Cielo')
    this.elevationTween = new Tween({ value: initialElevation })
    this.rotationTween = new Tween({ value: initialRotation })

    this.createUI()
  }

  /** Initializes the sun (light and position). */
  initializeSun () {

    this.sunLight.castShadow = true

    // Configure shadow camera frustum
    this.sunLight.shadow.camera.left = -400
    this.sunLight.shadow.camera.right = 400
    this.sunLight.shadow.camera.top = 400
    this.sunLight.shadow.camera.bottom = -400
    this.sunLight.shadow.camera.near = 0.5
    this.sunLight.shadow.camera.far = 800

    // Increase shadow map resolution
    this.sunLight.shadow.mapSize.width = 8192
    this.sunLight.shadow.mapSize.height = 8192

    // Add a bias to remove shadow artifacts
    this.sunLight.shadow.bias = -0.00075
    this.recalculateSunPosition()
  }

  /** Creates the UI options for the sky. */
  createUI () {

    // Controls whether the sun should be animated or not.
    this.animateCycle = checkbox('Animar Ciclo', true, (shouldAnimate) => {

      if (shouldAnimate) {
  
        this.elevationTween.resume()
        this.rotationTween.resume()
      }
  
      else {
  
        this.elevationTween.pause()
        this.rotationTween.pause()
      }
  
    }, this.guiFolder)

    // Controls the elevation of the sun.
    this.sunElevationSlider = slider('Elevación del Sol', this.sunElevation, [10, 60, 1], (value) => {

      this.sunElevation = value
      this.recalculateSunPosition()

    }, this.guiFolder)

    // Controls the rotation of the sun.
    this.sunRotationSlider = slider('Rotación del Sol', this.sunRotation, [-180, 180, 1], (value) => {

      this.sunRotation = value
      this.recalculateSunPosition()
      
    }, this.guiFolder)  
  }

  /** Starts the sun cycle animation. */
  startCycle () {

    this.elevationTween
      .to({ value: this.sunElevationSlider._max }, this.cycleDuration)
      .yoyo(true).repeat(Infinity)
      .onUpdate(({ value }) => { this.sunElevationSlider.setValue(value) })
      .startFromCurrentValues()

    this.rotationTween
      .to({ value: this.sunRotationSlider._max }, this.cycleDuration)
      .yoyo(true).repeat(Infinity)
      .onUpdate(({ value }) => { this.sunRotationSlider.setValue(value) })
      .startFromCurrentValues()
  }

  /** Recalculates the position of the sun. */
  recalculateSunPosition () {

    const phi = Three.MathUtils.degToRad(90 - this.sunElevation)
    const theta = Three.MathUtils.degToRad(this.sunRotation)
    
    this.sunPosition.setFromSphericalCoords(1, phi, theta)
    this.sunLight.position.copy(this.sunPosition.multiplyScalar(400))
    this.material.uniforms.sunPosition.value.copy(this.sunPosition)
  }
}