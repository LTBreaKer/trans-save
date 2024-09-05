import * as THREE from 'three';

const light = new THREE.DirectionalLight( 0xffffff, 8 );
light.position.set( 0, 1, 4);
light.castShadow = true;

export { light };