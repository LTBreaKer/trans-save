import { camera } from '../components/camera.js';
import { paddle_way } from '../utils/globaleVariable.js';
import { startGame } from './game.js';

let pointerMouse = -99999999;

export function zoomCamera(e) {
	(e.deltaY < 0) ?
	(camera.position.y += paddle_way * 0.05):
	(camera.position.y -= paddle_way * 0.05);
	camera.lookAt(0, 0, 0 );
	if (paddle_way < 0) camera.rotation.z += Math.PI;
	console.log("position Y: ", camera.position.y);
}

export function rotateTable(e) {
	if (!startGame && pointerMouse !== -99999999 && e.clientY !== pointerMouse) {
		(e.clientY < pointerMouse) ?
		(camera.position.z -= 0.01) :
		(camera.position.z += 0.01)
		camera.lookAt(0, 0, 0 );
		if (paddle_way < 0) camera.rotation.z += Math.PI;
			pointerMouse = e.clientY;
	}
	console.log("position Z: ", camera.position.z);
}

export function setPointerMouse(y) {
	pointerMouse = y;
}