import * as THREE from 'three';
import {PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_LONG, TABLE_HEIGHT, TABLE_DEPTH} from '../utils/globaleVariable.js'
import { disposeMesh } from './disposeComponent.js';

let lpaddle, rpaddle, lcenter_paddle, rcenter_paddle;

export function initPaddles() {
    const center_paddle_geometry = new THREE.BoxGeometry( PADDLE_LONG / 32, PADDLE_WIDTH+ 0.001, PADDLE_HEIGHT + 0.001 );
    // const center_paddle_material = new THREE.MeshPhongMaterial( { color: 0xffffff} );
    const center_paddle_material = new THREE.MeshStandardMaterial( { color: 0xffffff} );
    rcenter_paddle = new THREE.Mesh( center_paddle_geometry, center_paddle_material);
    lcenter_paddle = new THREE.Mesh( center_paddle_geometry, center_paddle_material);
    
    const paddle_geometry = new THREE.BoxGeometry( PADDLE_LONG, PADDLE_WIDTH, PADDLE_HEIGHT );
    const left_paddle_material = new THREE.MeshStandardMaterial( { color: 0xFF000C } );
    // const left_paddle_material = new THREE.MeshPhongMaterial( { color: 0xFF000C } );
    lpaddle = new THREE.Mesh( paddle_geometry, left_paddle_material);
    
    const right_paddle_material = new THREE.MeshStandardMaterial( { color: 0xA4FF25 } );
    // const right_paddle_material = new THREE.MeshPhongMaterial( { color: 0xA4FF25 } );
    rpaddle = new THREE.Mesh( paddle_geometry, right_paddle_material);
    
    lpaddle.castShadow = true;
    rpaddle.castShadow = true;
    lpaddle.add(lcenter_paddle);
    rpaddle.add(rcenter_paddle);
    
    lpaddle.position.z = (TABLE_HEIGHT + PADDLE_HEIGHT) / 2;
    rpaddle.position.z = (TABLE_HEIGHT + PADDLE_HEIGHT) / 2;
    rpaddle.position.y = (TABLE_DEPTH - PADDLE_WIDTH) / 2;
    lpaddle.position.y = -(TABLE_DEPTH - PADDLE_WIDTH) / 2;
}

export function disposePaddles() {
    lpaddle && disposeMesh(lpaddle);
    rpaddle && disposeMesh(rpaddle);
    lcenter_paddle && disposeMesh(lcenter_paddle);
    rcenter_paddle && disposeMesh(rcenter_paddle);
}

export {lpaddle, rpaddle}

// export function paddleDispose() {
//     center_paddle_geometry.dispose();
//     center_paddle_material.dispose();
//     console.log("THREE JS Material: ", center_paddle_geometry);
//     console.log("lpaddle: ", lpaddle);
// }
    