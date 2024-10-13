
import {canvas, click, TABLE_WIDTH, paddleHeight, height, box_result, first_player_goal, second_player_goal, counter, replay, popup_replay, pong_menu, loadDocument, sleep, back_counter, leftPaddle, paddle_way} from '../utils/globaleVariable.js';
// import { setPointerMouse, rotateTable, zoomCamera } from '../game/staduim.js'
import { closeGameSocket, connectAI, connectLocalGameSocket, connectPaddleSocket, launchGame } from '../game/game.js';
import {sendSocket} from '../game/game.js'
// import { connectGame , connect_ai} from '../utils/globaleVariable.js';
import { moveCamera } from '../components/camera.js';

////////       ------ LOCAL -----        //////////
import { lpaddle, rpaddle } from '../game/paddle.js';
import { keyDownHandler, keyUpHandler } from '../events/keyboardEvent.js';
import { aiGame, localgame, statePongGame } from '../../../components/ping/script.js';
import { initPlayGame } from '../../../components/pingpong/ping.js';

////////       ------ REMOTE ----------        //////////
import { paddle } from '../game/paddle.js';
import { lancePongGame } from '../main3d.js';
import { setMousePosition, setMousePositionHelper } from '../events/mouseEvent.js';
import { initGameComponents } from '../components/renderer.js';
import { fnGameOver, sendScore } from './socket.js';


console.log("0 statePongGame: ", statePongGame);

export function resizeCanvas(){
	let minHW = Math.min(window.innerWidth*0.99, window.innerHeight*0.99);
	canvas.style.width = (minHW - 100) + "px";
	canvas.style.height = (minHW - 100) + "px";
	canvas.style.marginTop = ((0.99 * window.innerHeight - minHW) * 0.5) + "px";
	canvas.style.marginLeft = ((0.99 * window.innerWidth - minHW) / 2) + "px";
	canvas.style.marginBottom = (0.01 * window.innerHeight) + "px";
	
	box_result.style.width = canvas.clientWidth + "px";
	box_result.style.marginLeft = canvas.style.marginLeft;
	first_player_goal.style.width = (canvas.clientWidth * 0.9) / 2 + "px";
	second_player_goal.style.width = (canvas.clientWidth * 0.9) / 2 + "px";
	let padding_top =  canvas.clientWidth * 0.06;
	let padding_left = canvas.clientWidth * 0.05;
	first_player_goal.style.paddingTop = padding_top + "px";
	first_player_goal.style.paddingLeft = padding_left + "px";
	second_player_goal.style.paddingTop = padding_top + "px";
	second_player_goal.style.paddingRight = padding_left + "px";
	console.log("--------- resize Canvas: ", canvas.style.height, " ", canvas.style.width);
	moveCamera(statePongGame);
}

async function replayLocalGame() {
	(statePongGame == "local") ? await localgame() : await aiGame();
	await loadDocument();
	resizeCanvas();
	back_counter.style.display = 'none';
	popup_replay.style.display = 'none';
	leftPaddle();
	await connectLocalGameSocket();
	await descounter();
}

async function handleRelodQuit() {
	console.log("============================================>", statePongGame);
	(statePongGame != "remote") ?
	sendScore() :
	(paddle_way == 1 ? sendScore(0, 3) : sendScore(3, 0));
	closeGameSocket();
	fnGameOver();
}

export function setupEventListeners() {
	window.addEventListener('resize', resizeCanvas);
	document.addEventListener("keydown", keyDownHandler, false);
	document.addEventListener("keyup", keyUpHandler, false);
	window.addEventListener("beforeunload", handleRelodQuit)
	window.addEventListener("hashchange", handleRelodQuit)
	if (statePongGame == "local" || statePongGame == "ai_bot") {
		replay.addEventListener("click", replayLocalGame);
		pong_menu.addEventListener("click", fnGameOver);
	}
	else if (statePongGame == "remote") {
		setMousePositionHelper();
		window.addEventListener('mousemove', setMousePosition);
	}
	console.log("-- setupEventListeners ==>", statePongGame);
}

export function removeEventsListener() {
	replay.removeEventListener("click", replayLocalGame);
	pong_menu.removeEventListener("click", fnGameOver);
	window.removeEventListener('resize', resizeCanvas);
	document.removeEventListener("keydown", keyDownHandler);
	document.removeEventListener("keyup", keyUpHandler);
	window.removeEventListener('mousemove', setMousePosition);
	window.removeEventListener('beforeunload', handleRelodQuit);
	window.removeEventListener("hashchange", handleRelodQuit)

}


export async function descounter() {
	back_counter.style.display = 'flex';
	for(let c=3; c > 0; c--) {
		counter.textContent = c;
		await sleep(1);
	}
	back_counter.style.display = 'none';
	sendSocket();
	launchGame();
}

function initGame() {
	back_counter.style.display = 'none';
	popup_replay.style.display = 'none';
	initGameComponents();
}

let replayGame = async () => {
	await loadDocument();
	resizeCanvas();
	initGame();
	if (statePongGame == "remote"){
		lancePongGame();
		await connectPaddleSocket();
	}
	else {
		lancePongGame();
		leftPaddle();
		await connectLocalGameSocket();
		await descounter();
	}
}

let lanceGame = async () => {
	console.log("------ lanceGame ==>>>", statePongGame);
	await replayGame();
	setupEventListeners();
}

initPlayGame(lanceGame);
replayGame();


// window.addEventListener("blur", handleblur)
// window.addEventListener("hashchange", hashchange)
// socket.addEventListener("close", disconnect)
// window.addEventListener("beforeunload", handleRelodQuit)