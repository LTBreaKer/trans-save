import * as THREE from 'three';
import { TABLE_DEPTH, TABLE_WIDTH } from '../utils/globaleVariable.js';

let light1, light2, light3, light4;

export function initLight() {
    light1 = new THREE.DirectionalLight( 0xffffff, 1);
    light1.position.set( TABLE_WIDTH/2, TABLE_WIDTH/2, 5);
    light1.castShadow = true;
    light2 = new THREE.DirectionalLight( 0xffffff, 1);
    light2.position.set( -TABLE_WIDTH/2, -TABLE_WIDTH/2, 5);
    light2.castShadow = true;
    light3 = new THREE.DirectionalLight( 0xffffff, 1);
    light3.position.set( -TABLE_WIDTH/2, TABLE_WIDTH/2, 5);
    light3.castShadow = true;
    light4 = new THREE.DirectionalLight( 0xffffff, 1);
    light4.position.set( TABLE_WIDTH/2, -TABLE_WIDTH/2, 5);
    light4.castShadow = true;
}
// const light = new THREE.DirectionalLight( 0xffffff, 8 );
// light.position.set( 0, 1, 4);
// light.castShadow = true;

export { light1, light2 , light3, light4};