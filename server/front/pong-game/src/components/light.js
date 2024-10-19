import * as THREE from 'three';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { TABLE_DEPTH, TABLE_HEIGHT, TABLE_WIDTH } from '../utils/globaleVariable.js';

let light1, light2, light3, light4;

let light, light_1, light_2;

function makeXYZGUI( gui, vector3, name, onChangeFn ) {

    const folder = gui.addFolder( name );
    folder.add( vector3, 'x', - 10, 10 ).onChange( onChangeFn );
    folder.add( vector3, 'y', 0, 10 ).onChange( onChangeFn );
    folder.add( vector3, 'z', - 10, 10 ).onChange( onChangeFn );
    folder.open();

}

export function initLight() {
    light1 = new THREE.DirectionalLight( 0x80c0d2, 0.3);
    light1.position.set( TABLE_WIDTH/4, TABLE_WIDTH/4, 5);
    light1.castShadow = true;
    light2 = new THREE.DirectionalLight( 0x80c0d2, 0.3);
    light2.position.set( -TABLE_WIDTH/4, -TABLE_WIDTH/4, 5);
    light2.castShadow = true;
    light3 = new THREE.DirectionalLight( 0x80c0d2, 0.3);
    light3.position.set( -TABLE_WIDTH/4, TABLE_WIDTH/4, 5);
    light3.castShadow = true;
    light4 = new THREE.DirectionalLight( 0x80c0d2, 0.3);
    light4.position.set( TABLE_WIDTH/4, -TABLE_WIDTH/4, 5);
    light4.castShadow = true;









    
    // light = new THREE.RectAreaLight(0x80c0d2, 10, TABLE_HEIGHT, TABLE_DEPTH);
    light = new THREE.RectAreaLight(0x80c0d2, 7, 2.06, 12.38);
    const helper = new RectAreaLightHelper( light );
    light.add( helper );
    // light.rotation.x -= Math.PI / 2;
    // light.position.x = 2.56;
    light.position.z = 4.34;
    const gui = new GUI();
    // gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
    
    const lightColor = { color: light.color.getHex() };
    gui.addColor(lightColor, 'color').name('color').onChange((value) => {
      light.color.setHex(value);
    });
    gui.add(light, 'intensity', 0, 10, 0.01);
    gui.add(light, 'width', 0, 20);
    gui.add(light, 'height', 0, 20);
    gui.add(light.rotation, 'x', -Math.PI, Math.PI).name('x rotation');
    gui.add(light.rotation, 'y', -Math.PI, Math.PI).name('y rotation');
    gui.add(light.rotation, 'z', -Math.PI, Math.PI).name('z rotation');
     
    makeXYZGUI(gui, light.position, 'position');


    light_1 = new THREE.RectAreaLight(0x80c0d2, 10, 0.11, 8.64);
    light_1.position.x = 2.56;
    light_1.position.z = 0.16;
    
    const light_1Color = { color: light_1.color.getHex() };
    gui.addColor(light_1Color, 'color').name('color').onChange((value) => {
      light_1.color.setHex(value);
    });
    gui.add(light_1, 'intensity', 0, 10, 0.01);
    gui.add(light_1, 'width', 0, 20);
    gui.add(light_1, 'height', 0, 20);
    gui.add(light_1.rotation, 'x', -Math.PI, Math.PI).name('x rotation');
    gui.add(light_1.rotation, 'y', -Math.PI, Math.PI).name('y rotation');
    gui.add(light_1.rotation, 'z', -Math.PI, Math.PI).name('z rotation');
     
    makeXYZGUI(gui, light_1.position, 'position');

    light_2 = new THREE.RectAreaLight(0x80c0d2, 10, 0.11, 8.64);
    light_2.position.x = -2.56;
    light_2.position.z = 0.16;
    
    const light_2Color = { color: light_2.color.getHex() };
    gui.addColor(light_2Color, 'color').name('color').onChange((value) => {
      light_2.color.setHex(value);
    });
    gui.add(light_2, 'intensity', 0, 10, 0.01);
    gui.add(light_2, 'width', 0, 20);
    gui.add(light_2, 'height', 0, 20);
    gui.add(light_2.rotation, 'x', -Math.PI, Math.PI).name('x rotation');
    gui.add(light_2.rotation, 'y', -Math.PI, Math.PI).name('y rotation');
    gui.add(light_2.rotation, 'z', -Math.PI, Math.PI).name('z rotation');
     
    makeXYZGUI(gui, light_2.position, 'position');
}
// const light = new THREE.DirectionalLight( 0xffffff, 8 );
// light.position.set( 0, 1, 4);
// light.castShadow = true;

export { light1, light2 , light3, light4, light, light_1, light_2};