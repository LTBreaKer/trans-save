import * as THREE from 'three';
import { initPaddles, lpaddle, rpaddle } from "../components/paddle.js";
import { initTable, table } from "../components/table.js";
import { initSphere, sphere } from "../components/sphere.js";
import { initLight, light1, light2, light3, light4 } from "../components/light.js";

let scene;
export function initScene() {
    scene = new THREE.Scene();
    
    initTable();
    initPaddles();
    initSphere();
    initLight();
    scene.add( table );
    scene.add( lpaddle );
    scene.add( rpaddle );
    scene.add( sphere );
    scene.add( light1 );
    scene.add( light2 );
    scene.add( light3 );
    scene.add( light4 );
}

export function removeLights() {
    scene.remove(light1);
    scene.remove(light2);
    scene.remove(light3);
    scene.remove(light4);
}

export function clearScene() {
    scene = null;
}

export {scene};