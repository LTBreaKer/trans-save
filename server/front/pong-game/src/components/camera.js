import * as THREE from 'three';
import { TABLE_DEPTH, TABLE_WIDTH, canvas, paddle_way } from '../utils/globaleVariable.js';

// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
let camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
export function initCamera(){
    camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
}

export function moveCamera(stateGame = "local") {
    console.log("--------------moveCamera---------------: ", paddle_way);
    if (stateGame == "remote")
        moveCameraRemoteGame()
    else {
        // camera.position.z = 5.8;
        camera.position.z = 6.2;
        camera.lookAt(0, 0, 0 );
        camera.rotation.z = Math.PI / 2;
    }
}

export function moveCameraRemoteGame() {
    if ((window.innerWidth - 100) < 400 && (window.innerWidth - 100) > 300) {
        camera.position.y = -paddle_way * 5.419999999999996;
        camera.position.z = 4.230000000000021;
    }
    else if (((window.innerWidth - 100) <= 300)) {
        camera.position.y = - paddle_way * 5.47;
        camera.position.z = 4.219999999999995;
    }
    else {
        camera.position.y = - paddle_way * ((TABLE_DEPTH / 2) + 2.0);
        camera.position.z = 3.6;
    }
    camera.lookAt(0, 0, 0);
    if (paddle_way < 0)
        camera.rotation.z += Math.PI;
}

moveCamera();

export { camera };