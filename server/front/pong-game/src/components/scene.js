import * as THREE from 'three';
import { initPaddles, lpaddle, rpaddle } from "../components/paddle.js";
import { initTable, table } from "../components/table.js";
import { initSphere, sphere } from "../components/sphere.js";
import { initLight, light1, light2, light3, light4, light, light_1, light_2 } from "../components/light.js";
import { initroom, room } from './room.js';

let scene;
export function initScene() {
    scene = new THREE.Scene();
    
    initTable();
    initroom();
    initPaddles();
    initSphere();
    initLight();
    scene.add( table );
    scene.add(room);
    scene.add( lpaddle );
    scene.add( rpaddle );
    scene.add( sphere );
    scene.add( light );
    scene.add( light_1 );
    scene.add( light_2 );
    scene.add( light1 );
    scene.add( light2 );
    scene.add( light3 );
    scene.add( light4 );
}

export function removeLights() {
    light && scene.remove(light);
    light_1 && scene.remove(light_1);
    light_2 && scene.remove(light_2);
    light1 && scene.remove(light1);
    light2 && scene.remove(light2);
    light3 && scene.remove(light3);
    light4 && scene.remove(light4);
}

export function clearScene() {
    scene = null;
}

export {scene};