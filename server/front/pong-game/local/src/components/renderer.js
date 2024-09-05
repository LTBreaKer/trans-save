import * as THREE from 'three'
import {canvas} from '../utils/globaleVariable.js'

const renderer = new THREE.WebGLRenderer({
    // antialias: true, // Enable antialiasing for smoother edges
    // powerPreference: "high-performance", // Use high performance for better quality
    alpha: true, antialias: true, canvas});
    renderer.setPixelRatio(window.devicePixelRatio); // Adjust for high DPI displays
renderer.setSize( Math.min(window.innerWidth, window.innerHeight), Math.min(window.innerWidth, window.innerHeight));
document.body.appendChild( renderer.domElement );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

export {renderer};