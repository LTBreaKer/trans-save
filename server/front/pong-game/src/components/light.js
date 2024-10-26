import * as THREE from 'three';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { TABLE_DEPTH, TABLE_HEIGHT, TABLE_WIDTH } from '../utils/globaleVariable.js';

let light1, light2, light3, light4;

let light, light_1, light_2;

export function initLight() {
    light1 = new THREE.DirectionalLight( 0x80c0d2, 0.4);
    light1.position.set( TABLE_WIDTH/4, TABLE_WIDTH/4, 5);
    light1.castShadow = true;
    light2 = new THREE.DirectionalLight( 0x80c0d2, 0.4);
    light2.position.set( -TABLE_WIDTH/4, -TABLE_WIDTH/4, 5);
    light2.castShadow = true;
    light3 = new THREE.DirectionalLight( 0x80c0d2, 0.4);
    light3.position.set( -TABLE_WIDTH/4, TABLE_WIDTH/4, 5);
    light3.castShadow = true;
    light4 = new THREE.DirectionalLight( 0x80c0d2, 0.4);
    light4.position.set( TABLE_WIDTH/4, -TABLE_WIDTH/4, 5);
    light4.castShadow = true;

    light = new THREE.RectAreaLight(0x80c0d2, 8, 4.74, 6.26);
    light.position.z = 3.64;

    light_1 = new THREE.RectAreaLight(0x80c0d2, 10, 0.11, 8.64);
    light_1.position.x = 2.56;
    light_1.position.z = 0.16;

    light_2 = new THREE.RectAreaLight(0x80c0d2, 10, 0.11, 8.64);
    light_2.position.x = -2.56;
    light_2.position.z = 0.16;
    
}

export { light1, light2 , light3, light4, light, light_1, light_2};