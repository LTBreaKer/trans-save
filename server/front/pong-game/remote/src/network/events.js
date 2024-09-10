import * as THREE from 'three';
import {canvas, click, TABLE_WIDTH, paddleHeight, height, box_result, first_player_goal, second_player_goal} from '../utils/globaleVariable.js';
import { paddle } from '../game/paddle.js';
import { setPointerMouse} from '../game/staduim.js'
import { rotateTable, zoomCamera } from '../game/staduim.js'
// import { setPointerMouse, rotateTable, zoomCamera } from '../game/staduim.js'
import { connectToWebSocket } from '../network/socket.js';
import { connectAI, connectPaddleSocket, launchGame } from '../game/game.js';
import {sendSocket} from '../game/game.js'
import { paddleSocket } from '../game/game.js';
import { connectGame , connect_ai} from '../utils/globaleVariable.js';
import { moveCamera } from '../components/camera.js';

// import { listUsers, login } from './login.js';

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

const mousePositionHelper = new MousePositionHelper();

function resizeCanvas(){
	let minHW = Math.min(window.innerWidth*0.99, window.innerHeight*0.99);
	canvas.style.width = (minHW - 100) + "px";
	canvas.style.height = (minHW - 100) + "px";
	canvas.style.marginTop = ((0.99 * window.innerHeight - minHW) * 0.5) + "px";
	canvas.style.marginLeft = ((0.99 * window.innerWidth - minHW) / 2) + "px";
	canvas.style.marginBottom = (0.01 * window.innerHeight) + "px";
	box_result.style.width = canvas.clientWidth + "px";
	first_player_goal.style.width = canvas.clientWidth / 2 + "px";
	second_player_goal.style.width = canvas.clientWidth / 2 + "px";
	let padding_top =  canvas.clientWidth * 0.06;
	let padding_left = canvas.clientWidth * 0.05;
	first_player_goal.style.paddingTop = padding_top + "px";
	first_player_goal.style.paddingLeft = padding_left + "px";
	second_player_goal.style.paddingTop = padding_top + "px";
	second_player_goal.style.paddingRight = padding_left + "px";
	// margin-bottom: 1%;
}

export function setupEventListeners() {
	console.log("setup event listener");
	window.addEventListener('resize', () => {
		// console.log("")
		resizeCanvas();
		moveCamera();
	})
	window.addEventListener('mousemove', setMousePosition);
	window.addEventListener('mousemove', rotateTable);
	window.addEventListener('wheel', zoomCamera);
	document.addEventListener("mouseup", () => setPointerMouse(-99999999))
	document.addEventListener("mousedown", (e) => {
		setPointerMouse(e.clientY);
	})

	document.querySelector("#runButton").addEventListener("click", () => {
		sendSocket();
		launchGame();
	})

	connectGame.addEventListener("click", () => {
		connectPaddleSocket();
		// console.log("hello");
	})

	connect_ai.addEventListener("click", () => {
		connectAI();
	})
	
	const login_button = document.querySelector("#login");
	login_button.addEventListener("click", login);

	document.addEventListener("keydown", keyDownHandler, false);
	document.addEventListener("keyup", keyUpHandler, false);

	function keyDownHandler(e) {
		if (e.key === "Right" || e.key === "ArrowRight")
			paddle.leftPressed = true;
		else if (e.key === "Left" || e.key === "ArrowLeft")
			paddle.rightPressed = true;
	}

	function keyUpHandler(e) {
		if (e.key === "Right" || e.key === "ArrowRight")
			paddle.leftPressed = false;
		else if (e.key === "Left" || e.key === "ArrowLeft")
			paddle.rightPressed = false;
	}	
}

// receiveInvitation("amin");

export {mousePositionHelper};



let rightPressed = false;
let leftPressed = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
	console.log(e.key);
	if (e.key === "Right" || e.key === "ArrowUp")
		right_paddle.rightPressed = true;
	else if (e.key === "Left" || e.key === "ArrowDown")
		right_paddle.leftPressed = true;
	if (e.key === "w")
		left_paddle.rightPressed = true;
	else if (e.key === "s")
		left_paddle.leftPressed = true;
}

function keyUpHandler(e) {
	if (e.key === "Right" || e.key === "ArrowUp")
		right_paddle.rightPressed = false;
	else if (e.key === "Left" || e.key === "ArrowDown")
		right_paddle.leftPressed = false;
	if (e.key === "w")
		left_paddle.rightPressed = false;
	else if (e.key === "s")
		left_paddle.leftPressed = false;
}
  