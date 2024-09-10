import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { paddle } from './paddle.js'
import { camera } from '../components/camera.js'
import { first_player_goal, second_player_goal, box_result, canvas } from '../utils/globaleVariable.js'
import { mousePosition, mousePositionHelper, setupEventListeners} from '../network/events.js';
import { scene } from '../components/scene.js'
import { renderer } from '../components/renderer.js'
import { connectToWebSocket } from '../network/socket.js';

export let startGame = false;
export let gameOver = false;

export let paddleSocket;

export function launchGame() {
	startGame = true;
}

export function stopGame() {
	gameOver = true;
}

async function movePaddle() {
	const ws = await paddleSocket;
	await ws.send(JSON.stringify(paddle.coordonate()));
}

export async function sendSocket(){
	const ws = await paddleSocket;
	await ws.send(JSON.stringify({'type_msg': 'move'}));
}

export async function connectPlayer(){
	const ws = await paddleSocket;
	await ws.send(JSON.stringify({'type': 'create_ball_socket'}))
}

export async function connectAI() {
	const ws = await paddleSocket;
	await ws.send(JSON.stringify({'type_msg': 'connect_ai'}));
}

export function connectPaddleSocket() {
	paddleSocket = connectToWebSocket();
}


function resizeRendererToDisplaySize(renderer) {	
	const canvas = renderer.domElement;
	// camera.aspect = canvas.clientWidth / canvas.clientHeight;
	// camera.updateProjectionMatrix();
	const pixelRatio = window.devicePixelRatio;
	const width  = Math.floor( canvas.clientWidth * pixelRatio) - 100;
	const height = Math.floor( canvas.clientHeight * pixelRatio) - 100	;
	const needResize = canvas.width !== width || canvas.height !== height;
	if (needResize) {
		console.log("width: ", width);
		console.log("height: ", height);
		console.log("canvas.width: ", canvas.width);
		console.log("canvas.height: ", canvas.height);
		console.log("canvas.clientWidth: ", canvas.clientWidth);
		console.log("canvas.clientHeight: ", canvas.clientheight);
		console.log("canvas.clientWidth / 2 + px: ", canvas.clientWidth / 2 + "px");
		// renderer.setSize(width, height, true);
		renderer.setSize(width, height, false);
		box_result.style.width = canvas.clientWidth + "px";
		first_player_goal.style.width = canvas.clientWidth / 2 + "px";
		second_player_goal.style.width = canvas.clientWidth / 2 + "px";
	}
	return (needResize);
}

box_result.style.width = canvas.clientWidth + "px";
first_player_goal.style.width = canvas.clientWidth / 2 + "px";
second_player_goal.style.width = canvas.clientWidth / 2 + "px";
// first_player_goal.style.color = 'rgb(204, 45, 45)';
// second_player_goal.style.color = 'rgb(45, 204, 45)';

export function animate() {
	if (resizeRendererToDisplaySize(renderer)) {
		console.log("--- need Resize ----");
		const canvas = renderer.domElement;
		camera.aspect = canvas.clientWidth / canvas.clientHeight;
		camera.updateProjectionMatrix();
	}
	// if (startGame) {
		mousePositionHelper.position(mousePosition, scene, camera);
		paddle.update()
		if (paddle.y != paddle.lastY) {
			paddle.lastY = paddle.y;
			movePaddle();
		}
		// }
		renderer.render( scene, camera );
	requestAnimationFrame( animate );
}

// if ( WebGL.isWebGLAvailable() )
// 	animate();
// else {
// 	const warning = WebGL.getWebGLErrorMessage();
// 	document.getElementById( 'container' ).appendChild( warning );
// }

// setupEventListeners();