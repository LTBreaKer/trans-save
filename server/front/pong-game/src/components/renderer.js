import * as THREE from 'three'
import {canvas} from '../utils/globaleVariable.js'
import { initScene, scene } from './scene.js';
import { initCamera } from './camera.js';
import { disposeScene } from './disposeComponent.js';

let renderer;

function initRenderer() {
    renderer = new THREE.WebGLRenderer({alpha: true, antialias: true, canvas});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize( Math.min(window.innerWidth, window.innerHeight), Math.min(window.innerWidth, window.innerHeight));
    document.body.appendChild( renderer.domElement );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

export function initGameComponents() {
    if (renderer) renderer.dispose();
    if (scene) disposeScene();
    initScene();
    initCamera();
    initRenderer();
}

export {renderer};