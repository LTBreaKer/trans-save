import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { lpaddle, paddle, rpaddle } from './paddle.js'
import { camera } from '../components/camera.js'
import { first_player_goal, second_player_goal, box_result, canvas, back_counter, sleep } from '../utils/globaleVariable.js'
import { scene } from '../components/scene.js'
import { renderer } from '../components/renderer.js'
import { connectGame, localGameSocket, paddleSocket } from '../network/socket.js';
import { game_data, statePongGame } from '../../../components/ping/script.js';
import { mousePosition, mousePositionHelper } from '../events/mouseEvent.js';
import { resizeCanvas } from '../network/events.js';
// import { changeAccess } from '../../../components/profile/profile.js';

export let startGame = false;
export let game_connected = false;
export let end_game = false;
let k = true;

let local_game_socket;
let paddle_socket;
export let animationFrameId;

export function initGameVariable() {
	k = true;
	startGame = false;
	game_connected = false;
	end_game = false;
}

export function launchGame() {
	if (game_connected)
		(startGame = true);
}

export function setGameConnected() {
	game_connected = true
}

export function stopGame() {
	startGame = false;
	console.log("stopGame startGame: ", startGame);
}

export function endGameConnection() {
	game_connected = false;
	startGame = false;
	end_game = true;
	k = true;
}


async function movePaddle() {
	const ws = await local_game_socket;
	if (ws && ws.readyState == 1)
		await ws.send(JSON.stringify(({"type_msg": "update_paddle", "lpaddle": lpaddle.coordonate(), "rpaddle": rpaddle.coordonate() })));
}

async function moveAiPaddle() {
	const ws = await local_game_socket;
	if (ws && ws.readyState == 1)
		await ws.send(JSON.stringify(({"type_msg": "update_rpaddle", "rpaddle": rpaddle.coordonate()})));
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
	console.log("start game: ", startGame);
	if (ws && ws.readyState == 1 && !startGame) {
		await ws.send(JSON.stringify({'type_msg': 'play'}));
		back_counter.style.display = "none";
		(!game_connected) && await connectGame();
		launchGame();
	}
}

export async function playRemotePongGame(){
	const ws = await paddle_socket;
	if (ws && ws.readyState == 1) {
		await ws.send(JSON.stringify({'type_msg': 'move'}));
		// (!game_connected) && await connectGame();
	}
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
	const pixelRatio = window.devicePixelRatio;
	const width  = Math.floor( canvas.clientWidth * pixelRatio) - 100;
	const height = Math.floor( canvas.clientHeight * pixelRatio) - 100;
	const needResize = canvas.width !== width || canvas.height !== height;
	if (needResize)
		renderer.setSize(width, height, false);
	return (needResize);
}

export function animate() {
	if (resizeRendererToDisplaySize(renderer)) {
		const canvas = renderer.domElement;
		camera.aspect = canvas.clientWidth / canvas.clientHeight;
		camera.updateProjectionMatrix();
	}
	if (startGame) updatePaddles();
	renderer.render( scene, camera );	
	animationFrameId = requestAnimationFrame( animate );
}

async function sendToken() {
	// k = false;
	// await sleep(60 * 4);
	// await changeAccess();
	const ws = (statePongGame == "remote")? await paddle_socket :await local_game_socket;
	if (ws && ws.readyState == 1)
		await ws.send(JSON.stringify({
			'type_msg': 'update_token',
			'token': localStorage.getItem("token")
		}))
	// k = true;
}


async function updatePaddles(){
	if (statePongGame == "local" || statePongGame == "tournament") {
		lpaddle.update();
		rpaddle.update();
		if (lpaddle.y != lpaddle.lastY || rpaddle.y != rpaddle.lastY) {
			lpaddle.lastY = lpaddle.y;
			rpaddle.lastY = rpaddle.y;
			movePaddle();
		}
	}
	else if (statePongGame == "ai_bot") {
		rpaddle.update()
		if (rpaddle.y != rpaddle.lastY) {
			rpaddle.lastY = rpaddle.y;
			moveAiPaddle();
		}
	}
	else if (statePongGame == "remote") {
		// mousePositionHelper.position(mousePosition, scene, camera);
		paddle.update()
		if (paddle.y != paddle.lastY) {
			paddle.lastY = paddle.y;
			moveRemotePaddle();
		}
	}
	// if (k)
	sendToken();
}


// if ( WebGL.isWebGLAvailable() )
// 	animate();
// else {
// 	const warning = WebGL.getWebGLErrorMessage();
// 	document.getElementById( 'container' ).appendChild( warning );
// }

// setupEventListeners();