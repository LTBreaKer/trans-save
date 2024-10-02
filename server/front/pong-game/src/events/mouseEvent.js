import * as THREE from 'three';
import { canvas, height, paddleHeight, TABLE_WIDTH } from '../utils/globaleVariable.js';
import { paddle } from '../game/paddle.js';

export const mousePosition = {x: 0, y: 0};

export class MousePositionHelper {
	constructor() {
		this.raycaster = new THREE.Raycaster();
	}

	position(normalizedPosition, scene, camera) {
		this.raycaster.setFromCamera(normalizedPosition, camera);
		const intersectedObjects = this.raycaster.intersectObjects(scene.children);
		if (intersectedObjects.length)
			paddle.mouseUpdate(((intersectedObjects[0].point.x + TABLE_WIDTH / 2) * height) / TABLE_WIDTH - paddleHeight / 2);
	}
}

function getCanvasRelativePosition(event) {
	const rect = canvas.getBoundingClientRect();
	return {
		x: (event.clientX - rect.left) * canvas.width / rect.width,
		y: (event.clientY - rect.top ) * canvas.height / rect.height,
	};
}

export function setMousePosition(event) {
	const pos = getCanvasRelativePosition(event);
	mousePosition.x = (pos.x / canvas.width ) *  2 - 1;
	mousePosition.y = (pos.y / canvas.height) * -2 + 1;
}

export const mousePositionHelper = new MousePositionHelper();