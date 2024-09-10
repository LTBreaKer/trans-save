import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { lpaddle, rpaddle } from './paddle.js'
import { camera } from '../components/camera.js'
import { first_player_goal, second_player_goal, box_result, canvas } from '../utils/globaleVariable.js'
import { setupEventListeners } from '../network/events.js';
import { scene } from '../components/scene.js'
import { renderer } from '../components/renderer.js'
import { connectBallSocket } from '../network/socket.js';

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
	await ws.send(JSON.stringify(({"type_msg": "update_paddle", "lpaddle": lpaddle.coordonate(), "rpaddle": rpaddle.coordonate() })));
}

export async function sendSocket(){
	const ws = await paddleSocket;
	await ws.send(JSON.stringify({'type_msg': 'play'}));
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
	paddleSocket = connectBallSocket();
}


function resizeRendererToDisplaySize(renderer) {	
	const canvas = renderer.domElement;
	// camera.aspect = canvas.clientWidth / canvas.clientHeight;
	// camera.updateProjectionMatrix();
	const pixelRatio = window.devicePixelRatio;
	const width  = Math.floor( canvas.clientWidth * pixelRatio) - 100;
	const height = Math.floor( canvas.clientHeight * pixelRatio) - 100;
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
		let minHW = Math.min(window.innerWidth*0.99, window.innerHeight*0.99);
		canvas.style.width = (minHW - 100) + "px";
		canvas.style.height = (minHW - 100) + "px";
		canvas.style.marginTop = ((0.99 * window.innerHeight - minHW) * 0.5) + "px";
		canvas.style.marginLeft = ((0.99 * window.innerWidth - minHW) / 2) + "px";
		canvas.style.marginBottom = (0.01 * window.innerHeight) + "px";
		box_result.style.width = canvas.clientWidth + "px";
		box_result.style.marginLeft = canvas.style.marginLeft;
		console.log("0box_result.style.width: ", box_result.style.width);
		first_player_goal.style.width = canvas.clientWidth / 2 + "px";
		second_player_goal.style.width = canvas.clientWidth / 2 + "px";
		let padding_top =  canvas.clientWidth * 0.06;
		let padding_left = canvas.clientWidth * 0.05;
		first_player_goal.style.paddingTop = padding_top + "px";
		first_player_goal.style.paddingLeft = padding_left + "px";
		second_player_goal.style.paddingTop = padding_top + "px";
		second_player_goal.style.paddingRight = padding_left + "px";
	}
	return (needResize);
}

box_result.style.width = canvas.clientWidth + "px";
console.log("2box_result.style.width: ", box_result.style.width);
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
		lpaddle.update()
		rpaddle.update()
		if (lpaddle.y != lpaddle.lastY || rpaddle.y != lpaddle.lastY) {
			lpaddle.lastY = lpaddle.y;
			rpaddle.lastY = rpaddle.y;
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