
import {canvas, click, TABLE_WIDTH, paddleHeight, height, box_result, first_player_goal, second_player_goal, counter, replay, popup_replay, pong_menu, loadDocument, sleep, back_counter} from '../utils/globaleVariable.js';
// import { setPointerMouse, rotateTable, zoomCamera } from '../game/staduim.js'
import { connectAI, connectLocalGameSocket, connectPaddleSocket, launchGame } from '../game/game.js';
import {sendSocket} from '../game/game.js'
// import { connectGame , connect_ai} from '../utils/globaleVariable.js';
import { moveCamera } from '../components/camera.js';

////////       ------ LOCAL -----        //////////
import { lpaddle, rpaddle } from '../game/paddle.js';
import { keyDownHandler, keyUpHandler } from '../events/keyboardEvent.js';
import { localgame, statePongGame } from '../../../components/ping/script.js';
import { initPlayGame } from '../../../components/pingpong/ping.js';

////////       ------ REMOTE ----------        //////////
import { paddle } from '../game/paddle.js';
import { lancePongGame } from '../main3d.js';
import { setMousePosition, setMousePositionHelper } from '../events/mouseEvent.js';
import { initGameComponents } from '../components/renderer.js';


// console.log("0 statePongGame: ", statePongGame);

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
	await localgame();
	await replayGame();
}

export function setupEventListeners() {
	window.addEventListener('resize', resizeCanvas);
	document.addEventListener("keydown", keyDownHandler, false);
	document.addEventListener("keyup", keyUpHandler, false);
	if (statePongGame == "local") {
		replay.addEventListener("click", replayLocalGame);
		pong_menu.addEventListener("click", () =>
			window.location.hash = "/ping")
	}
	else if (statePongGame == "remote") {
		setMousePositionHelper();
		window.addEventListener('mousemove', setMousePosition);
	}
	console.log("-- setupEventListeners ==>", statePongGame);
}

export function removeEventsListener() {
	replay.removeEventListener("click", replayLocalGame);
	window.removeEventListener('resize', resizeCanvas);
	document.removeEventListener("keydown", keyDownHandler);
	document.removeEventListener("keyup", keyUpHandler);
	window.removeEventListener('mousemove', setMousePosition);
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
	if (statePongGame == "local") {
		lancePongGame();	
		await connectLocalGameSocket();
		await descounter();
	}
	else if (statePongGame == "remote"){
		lancePongGame();
		await connectPaddleSocket();
	}
}

let lanceGame = async () => {
	console.log("------ lanceGame ==>>>", statePongGame);
	await replayGame();
	setupEventListeners();
}

initPlayGame(lanceGame);
replayGame();
