import * as THREE from 'three'
import {canvas} from '../utils/globaleVariable.js'
import { initScene, scene } from './scene.js';
import { initCamera } from './camera.js';
import { disposeScene } from './disposeComponent.js';

let renderer;

function initRenderer() {
    renderer = new THREE.WebGLRenderer({
        // antialias: true, // Enable antialiasing for smoother edges
        // powerPreference: "high-performance", // Use high performance for better quality
        alpha: true, antialias: true, canvas});
        renderer.setPixelRatio(window.devicePixelRatio); // Adjust for high DPI displays
    renderer.setSize( Math.min(window.innerWidth, window.innerHeight), Math.min(window.innerWidth, window.innerHeight));
    document.body.appendChild( renderer.domElement );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    // renderer.outputEncoding = THREE.sRGBEncoding;
    // renderer.physicallyCorrectLights = true;
}

export function initGameComponents() {
    if (renderer) renderer.dispose();
    if (scene) disposeScene();
    initScene();
    initCamera();
    initRenderer();
}

export {renderer};