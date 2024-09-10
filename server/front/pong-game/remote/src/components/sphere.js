import * as THREE from 'three';
import {BALL_RADUIS, loader, TABLE_HEIGHT} from '../utils/globaleVariable.js'

const texture = loader.load('/images/pong/textures/silver_metal.jpg');
texture.colorSpace = THREE.SRGBColorSpace;
// const sphere_material = new THREE.MeshPhongMaterial( {  map: texture } );
const sphere_material = new THREE.MeshPhongMaterial( {  color: 0xffffff } );
const sphere_geometry = new THREE.SphereGeometry( BALL_RADUIS, 32, 16 );
// const sphere_geometry = new THREE.CylinderGeometry( BALL_RADUIS, BALL_RADUIS, PADDLE_HEIGHT, 32 ); 
const sphere = new THREE.Mesh( sphere_geometry, sphere_material);

sphere.rotation.x += Math.PI / 2;
sphere.castShadow = true;
sphere.position.z = TABLE_HEIGHT / 2 + BALL_RADUIS;

export {sphere}