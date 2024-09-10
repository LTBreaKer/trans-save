import * as THREE from 'three';

const light1 = new THREE.DirectionalLight( 0xffffff, 1);
light1.position.set( 4, 4, 5);
light1.castShadow = true;
const light2 = new THREE.DirectionalLight( 0xffffff, 1);
light2.position.set( -4, -4, 5);
light2.castShadow = true;
const light3 = new THREE.DirectionalLight( 0xffffff, 1);
light3.position.set( -4, 4, 5);
light3.castShadow = true;
const light4 = new THREE.DirectionalLight( 0xffffff, 1);
light4.position.set( 4, -4, 5);
light4.castShadow = true;
// const light = new THREE.DirectionalLight( 0xffffff, 8 );
// light.position.set( 0, 1, 4);
// light.castShadow = true;

export { light1, light2 , light3, light4};