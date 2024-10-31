import * as THREE from 'three';
import {BALL_RADUIS, TABLE_HEIGHT} from '../utils/globaleVariable.js'
import { disposeMesh } from './disposeComponent.js';

let sphere;

export function initSphere() {
    const sphere_material = new THREE.MeshStandardMaterial( {  color: 0xffffff } );
    const sphere_geometry = new THREE.SphereGeometry( BALL_RADUIS, 32, 16 );
    sphere = new THREE.Mesh( sphere_geometry, sphere_material);
    
    sphere.rotation.x += Math.PI / 2;
    sphere.castShadow = true;
    sphere.position.z = TABLE_HEIGHT / 2 + BALL_RADUIS;
}

export function disposeSphere() {
    sphere && disposeMesh(sphere);
}

export {sphere}