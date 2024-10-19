import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { lpaddle, paddle, rpaddle } from './paddle.js'
import { camera } from '../components/camera.js'
import { first_player_goal, second_player_goal, box_result, canvas } from '../utils/globaleVariable.js'
import { scene } from '../components/scene.js'
import { renderer } from '../components/renderer.js'
import { localGameSocket, paddleSocket } from '../network/socket.js';
import { game_data, statePongGame } from '../../../components/ping/script.js';
import { mousePosition, mousePositionHelper } from '../events/mouseEvent.js';
import { resizeCanvas } from '../network/events.js';

export let startGame = false;
// export let gameOver = false;

let local_game_socket;
let paddle_socket;
export let animationFrameId;

export function launchGame() {
	startGame = true;
}

export function stopGame() {
	gameOver = true;
}

async function movePaddle() {
	const ws = await local_game_socket;
	if (ws && ws.readyState == 1)
		await ws.send(JSON.stringify(({"type_msg": "update_paddle", "lpaddle": lpaddle.coordonate(), "rpaddle": rpaddle.coordonate() })));
}

async function moveAiPaddle() {
	const ws = await local_game_socket;
	if (ws && ws.readyState == 1)
		await ws.send(JSON.stringify(({"type_msg": "update_lpaddle", "lpaddle": lpaddle.coordonate()})));
}


async function moveRemotePaddle() {
	const ws = await paddle_socket;
	if (ws && ws.readyState == 1){
		console.log("update_paddle", paddle.coordonate());
		await ws.send(JSON.stringify({"type_msg": "update_paddle", "paddle": paddle.coordonate()}));
	}
}

export async function closeGameSocket() {
	let ws = (statePongGame == "remote") ?
		await paddle_socket :
		await local_game_socket;
	if (ws && ws.readyState == 1)
		await ws.send(JSON.stringify({"type_msg": "close"}));
}

export async function checkSocketConnection() {
	let ws = (statePongGame == "remote") ?
	await paddle_socket :
	await local_game_socket;
	return (ws && ws.readyState == 1) ? 1: 0;
}

export async function sendSocket(){
	const ws = await local_game_socket;
	if (ws && ws.readyState == 1)
		await ws.send(JSON.stringify({'type_msg': 'play'}));
}

export async function playRemotePongGame(){
	const ws = await paddle_socket;
	await ws.send(JSON.stringify({'type_msg': 'move'}));
}

export async function connectPlayer(){
	const ws = await local_game_socket;
	await ws.send(JSON.stringify({'type': 'create_ball_socket'}))
}

export async function connectAI() {
	const ws = await local_game_socket;
	await ws.send(JSON.stringify({'type_msg': 'connect_ai'}));
}

export async function connectLocalGameSocket() {
	local_game_socket = await localGameSocket();
}

export async function connectPaddleSocket() {
	paddle_socket = await paddleSocket();
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
		renderer.setSize(width, height, false);
		resizeCanvas();
	}
	return (needResize);
}

export function animate() {
	if (resizeRendererToDisplaySize(renderer)) {
		// console.log("--- need Resize ----");
		const canvas = renderer.domElement;
		camera.aspect = canvas.clientWidth / canvas.clientHeight;
		camera.updateProjectionMatrix();
	}
	// if (startGame) {
	updatePaddles();
		// }
	renderer.render( scene, camera );
	animationFrameId = requestAnimationFrame( animate );
}

async function updatePaddles(){
	if (statePongGame == "local" || statePongGame == "tournament") {
		lpaddle.update()
		rpaddle.update()
		if (lpaddle.y != lpaddle.lastY || rpaddle.y != lpaddle.lastY) {
			lpaddle.lastY = lpaddle.y;
			rpaddle.lastY = rpaddle.y;
			movePaddle();
		}
	}
	else if (statePongGame == "ai_bot") {
		lpaddle.update()
		if (lpaddle.y != lpaddle.lastY) {
			lpaddle.lastY = lpaddle.y;
			moveAiPaddle();
		}
	}
	else if (statePongGame == "remote") {
		mousePositionHelper.position(mousePosition, scene, camera);
		paddle.update()
		if (paddle.y != paddle.lastY) {
			paddle.lastY = paddle.y;
			moveRemotePaddle();
		}
	}
}

function playerChoicePaddle({name_current_user, player1_name}) {
	(name_current_user === player1_name) ? paddle.left() : paddle.right();
}

if (statePongGame == "remote")
	playerChoicePaddle(game_data);
// if ( WebGL.isWebGLAvailable() )
// 	animate();
// else {
// 	const warning = WebGL.getWebGLErrorMessage();
// 	document.getElementById( 'container' ).appendChild( warning );
// }

// setupEventListeners();