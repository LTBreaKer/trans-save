import * as THREE from 'three';
import { TABLE_DEPTH, canvas, paddle_way } from '../utils/globaleVariable.js';

// const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
export function moveCamera() {
    if ((window.innerWidth - 100) < 700 && (window.innerWidth - 100) > 500) {
        let nwidth = canvas.clientWidth * 0.01
        camera.position.y = -paddle_way * (nwidth / 2);
        camera.position.z = nwidth * 1.4;
        // let nwidth = canvas.clientWidth * 0.01
        // camera.position.y = - (nwidth / 2);
        // camera.position.z = nwidth * 1.4;
    }
    else if (((window.innerWidth - 100) < 500) && ((window.innerWidth - 100) >= 350)) {
        let nwidth = canvas.clientWidth * 0.01
        camera.position.y = -paddle_way * (nwidth / 4);
        camera.position.z = nwidth * 1.8;
        // let nwidth = canvas.clientWidth * 0.01
        // camera.position.y = - (nwidth / 4);
        // camera.position.z = nwidth * 1.8;
        console.log("0 camera.position.z: ", camera.position.z);
    }
    else if ((window.innerWidth - 100) < 350) {
        // let nwidth = canvas.clientWidth * 0.01
        camera.position.y = 0;
        camera.position.z = 5.8;
        // camera.position.z = 200;
        console.log("1 camera.position.z: ", camera.position.z);
    }
    else {
        let nwidth = canvas.clientWidth * 0.01
        camera.position.y = -paddle_way * ((TABLE_DEPTH / 2) + 4.5);
        camera.position.z = 3;
        console.log("2 camera.position.z: ", camera.position.z);
        // camera.position.set(0, -(TABLE_DEPTH / 2) - 4.5, 3);
    }
    camera.lookAt(0, 0, 0 );
    if (paddle_way < 0)
        camera.rotation.z += Math.PI;
}
moveCamera();

export { camera };