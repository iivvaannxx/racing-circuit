import { 
  
  GUI,
  
  NumberController, 
  BooleanController, 
  FunctionController,
  OptionController,
  ColorController
  
} from 'lil-gui'

/** The graphical user interface options. */
export const globalGUI = new GUI({ title: 'Opciones' })
globalGUI.domElement.classList.add('global-gui')

/**
 * Creates a slider control and adds it to the GUI.
 *
 * @param {string} name - The name of the slider control.
 * @param {number} value - The initial value of the slider control.
 * @param {number[]} range - An array containing the minimum, maximum, and step values for the slider control.
 * @param {function} onChange - A function to be called when the slider value changes.
 * @param {GUI|null} folder - An optional dat.GUI folder to add the slider control to.
 * @returns {NumberController} - The dat.GUIController object representing the slider control.
*/

export function slider (name, value, range, onChange, folder = null) {

  const [min, max, step] = range
  const controls = folder ?? globalGUI

  return controls.add({ value }, 'value')
    .name(name)
    .min(min)
    .max(max)
    .step(step)
    .onChange(onChange)
}

/**
 * Creates a checkbox control in the GUI.
 *
 * @param {string} name - The name of the checkbox control.
 * @param {boolean} value - The initial value of the checkbox control.
 * @param {Function} onChange - The function to be called when the checkbox value changes.
 * @param {GUI|null} [folder=null] - The folder to add the checkbox control to. If not provided, the global GUI will be used.
 * @returns {BooleanController} - The created checkbox control.
*/

export function checkbox (name, value, onChange, folder = null) {

  const controls = folder ?? globalGUI
  return controls.add({ value }, 'value')
    .name(name)
    .onChange(onChange)
}

/**
 * Creates a button control in the GUI.
 *
 * @param {string} name - The name of the button control.
 * @param {Function} onClick - The function to be called when the button is clicked.
 * @param {GUI|null} [folder=null] - The folder to add the button control to. If not provided, the global GUI will be used.
 * @returns {FunctionController} - The created button control.
*/

export function button (name, onClick, folder = null) {

  const controls = folder ?? globalGUI
  return controls.add({ onClick }, 'onClick')
    .name(name)
}


/**
 * Creates a color control in the GUI.
 *
 * @param {string} name - The name of the control.
 * @param {string} value - The initial value of the control.
 * @param {function} onChange - The function to call when the control value changes.
 * @param {GUI|null} [folder=null] - The folder to add the control to. If null, adds to the global GUI.
 * @returns {ColorController} - The created color control.
*/

export function color (name, value, onChange, folder = null) {

  const controls = folder ?? globalGUI
  return controls.addColor({ value }, 'value')
    .name(name)
    .onChange(onChange)
}

/**
 * Creates a dropdown control with the given name, options, value, onChange function, and optional folder.
 * 
 * @param {string} name - The name of the dropdown control.
 * @param {Array<string>|Record<string, any>} options - The options to be displayed in the dropdown.
 * @param {string} value - The initial value of the dropdown.
 * @param {Function} onChange - The function to be called when the dropdown value changes.
 * @param {Object} [folder=null] - The folder to add the dropdown control to. If null, adds to globalGUI.
 * @returns {OptionController} - The created dropdown control.
*/

export function dropdown (name, options, value, onChange, folder = null) {

  const controls = folder ?? globalGUI
  return controls.add({ value }, 'value', options)
    .name(name)
    .onChange(onChange)
}

/**
 * Creates a new folder in the GUI with the given name.
 * If a folder is provided, the new folder will be added as a subfolder of the provided folder.
 * If no folder is provided, the new folder will be added to the global GUI.
 * 
 * @param {string} name - The name of the new folder.
 * @param {GUI|null} [folder=null] - The folder to add the new folder to (optional).
*/

export function folder (name, folder = null) {

  const controls = folder ?? globalGUI
  return controls.addFolder(name)
}