import * as THREE from 'three';
import {canvas, click, TABLE_WIDTH, paddleHeight, height, box_result, first_player_goal, second_player_goal, counter, replay, popup_replay, pong_menu, loadDocument, sleep} from '../utils/globaleVariable.js';
// import { setPointerMouse, rotateTable, zoomCamera } from '../game/staduim.js'
import { connectAI, connectLocalGameSocket, connectPaddleSocket, launchGame } from '../game/game.js';
import {sendSocket} from '../game/game.js'
// import { connectGame , connect_ai} from '../utils/globaleVariable.js';
import { moveCamera } from '../components/camera.js';

////////       ------ LOCAL -----        //////////
import { lpaddle, rpaddle } from '../game/paddle.js';
import { localgame, statePongGame } from '../../../components/ping/script.js';
import { initPlayGame } from '../../../components/pingpong/ping.js';

////////       ------ REMOTE ----------        //////////
import { paddle } from '../game/paddle.js';


console.log("0 statePongGame: ", statePongGame);

function resizeCanvas(){
	let minHW = Math.min(window.innerWidth*0.99, window.innerHeight*0.99);
	canvas.style.width = (minHW - 100) + "px";
	canvas.style.height = (minHW - 100) + "px";
	canvas.style.marginTop = ((0.99 * window.innerHeight - minHW) * 0.5) + "px";
	canvas.style.marginLeft = ((0.99 * window.innerWidth - minHW) / 2) + "px";
	canvas.style.marginBottom = (0.01 * window.innerHeight) + "px";
	console.log("11 canvas.style.marginLeft: ", canvas.style.marginLeft);
	console.log("11 box_result.style.width: ", box_result.style.width);
	
	box_result.style.width = canvas.clientWidth + "px";
	box_result.style.marginLeft = canvas.style.marginLeft;
	console.log("12 box_result.style.width: ", box_result.style.width);
	first_player_goal.style.width = (canvas.clientWidth * 0.9) / 2 + "px";
	second_player_goal.style.width = (canvas.clientWidth * 0.9) / 2 + "px";
	let padding_top =  canvas.clientWidth * 0.06;
	let padding_left = canvas.clientWidth * 0.05;
	first_player_goal.style.paddingTop = padding_top + "px";
	first_player_goal.style.paddingLeft = padding_left + "px";
	second_player_goal.style.paddingTop = padding_top + "px";
	second_player_goal.style.paddingRight = padding_left + "px";
	// margin-bottom: 1%;
}

async function replayLocalGame() {
	console.log("11111111111");
	await localgame();
	await replayGame();
}

////////       ------ LOCAL -----        //////////
export function setupElementEvenent() {
	console.log("setupElementEvenent 11111111111111");
	if (statePongGame == "local") {
		replay.addEventListener("click", () => replayLocalGame());
		pong_menu.addEventListener("click", () =>
			window.location.hash = "/ping")
	}
	else if (statePongGame == "remote") {

	}
}


export function setupEventListeners() {
	console.log("setup event listener");
	window.addEventListener('resize', () => {
		resizeCanvas();
		moveCamera(statePongGame);
	});
	
	document.querySelector("#runButton").addEventListener("click", () => {
		sendSocket();
		launchGame();
	});
	setupElementEvenent();
	// window.addEventListener('mousemove', rotateTable);
	// window.addEventListener('wheel', zoomCamera);
	// document.addEventListener("mouseup", () => setPointerMouse(-99999999))
	// document.addEventListener("mousedown", (e) => {
	// 		setPointerMouse(e.clientY);
	// 	})

	// connectGame.addEventListener("click", () => {
	// 	connectPaddleSocket();
	// 	// console.log("hello");
	// })
		
	// connect_ai.addEventListener("click", () => {
	// 	connectAI();
	// });
	// const login_button = document.querySelector("#login");
	// login_button.addEventListener("click", login);

	document.addEventListener("keydown", keyDownHandler, false);
	document.addEventListener("keyup", keyUpHandler, false);
	function keyDownHandler(e) {
		if (e.key === "Right" || e.key === "ArrowUp")
			lpaddle.leftPressed = true;
		else if (e.key === "Left" || e.key === "ArrowDown")
			lpaddle.rightPressed = true;
		if (e.key === "w" || e.key === "W")
			rpaddle.leftPressed = true;
		else if (e.key === "s" || e.key === "S")
			rpaddle.rightPressed = true;
		if (e.key === "Right" || e.key === "ArrowRight")
			paddle.leftPressed = true;
		else if (e.key === "Left" || e.key === "ArrowLeft")
			paddle.rightPressed = true;
	}
	function keyUpHandler(e) {
		if (e.key === "Right" || e.key === "ArrowUp")
			lpaddle.leftPressed = false;
		else if (e.key === "Left" || e.key === "ArrowDown")
			lpaddle.rightPressed = false;
		if (e.key === "w" || e.key === "W")
			rpaddle.leftPressed = false;
		else if (e.key === "s" || e.key === "S")
			rpaddle.rightPressed = false;
		if (e.key === "Right" || e.key === "ArrowRight")
			paddle.leftPressed = false;
		else if (e.key === "Left" || e.key === "ArrowLeft")
			paddle.rightPressed = false;
	}
}

export async function descounter() {
	back_counter.style.zIndex = 100;
	for(let c=3; c > 0; c--) {
		counter.textContent = c;
		await sleep(1);
	}
	back_counter.style.zIndex = 1;
	sendSocket();
	launchGame();
}

let replayGame = async () => {
	console.log("  initGame  initGame  initGame  initGame");
	back_counter.style.zIndex = 1;
	moveCamera(statePongGame);
	console.log("1 statePongGame: ", statePongGame);

	if (statePongGame == "local") {
		await connectLocalGameSocket();
		popup_replay.style.zIndex = 1;
		await descounter();
	}
	else if (statePongGame == "remote"){
		await connectPaddleSocket();
	}
}

let initGame = async () => {
	await loadDocument();
	await replayGame();
	setupElementEvenent();
}

initPlayGame(initGame);
replayGame();
