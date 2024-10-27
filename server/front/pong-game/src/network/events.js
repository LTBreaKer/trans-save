
import {canvas, click, TABLE_WIDTH, paddleHeight, height, box_result, first_player_goal, second_player_goal, counter, replay, popup_replay, pong_menu, loadDocument, sleep, back_counter, leftPaddle, paddle_way, first_player_name, second_player_name, p_second, p_first, loadReplayDocument, loadQuitDocument, double_point} from '../utils/globaleVariable.js';
// import { setPointerMouse, rotateTable, zoomCamera } from '../game/staduim.js'
import { closeGameSocket, connectAI, connectLocalGameSocket, connectPaddleSocket, end_game, initGameVariable, startGame } from '../game/game.js';
import {sendSocket} from '../game/game.js'
import { moveCamera } from '../components/camera.js';

////////       ------ LOCAL -----        //////////
import { initPaddleInstance } from '../game/paddle.js';
import { keyDownHandler, keyUpHandler } from '../events/keyboardEvent.js';
import { aiGame, game_data, localgame, statePongGame } from '../../../components/ping/script.js';
import { initPlayGame } from '../../../components/pingpong/ping.js';

////////       ------ REMOTE ----------        //////////
import {  } from '../game/paddle.js';
import { lancePongGame } from '../main3d.js';
import { setMousePosition, setMousePositionHelper } from '../events/mouseEvent.js';
import { initGameComponents } from '../components/renderer.js';
import { fnGameOver, sendLoserScore, sendScore, sendWinnerScore, showWinner } from './socket.js';
import { loadHTML } from '../../../utils.js';
import { get_localstorage } from '../../../auth.js';
import { cancelTournamentMatch } from '../utils/request.js';
const url = "https://127.0.0.1:9008/api/tournament/cancel-match/";
let html_popup_replay;
let html_popup_game_over;
let html_pong_loader;
console.log("0 statePongGame: ", statePongGame);

export function resizeCanvas(){
	let minHW = Math.min(window.innerWidth*0.99, window.innerHeight*0.99);
	canvas.style.width = (minHW) + "px";
	canvas.style.height = (minHW) + "px";
	canvas.style.marginTop = ((0.99 * window.innerHeight - minHW) * 0.5) + "px";
	canvas.style.marginLeft = ((0.99 * window.innerWidth - minHW) / 2) + "px";
	canvas.style.marginBottom = (0.01 * window.innerHeight) + "px";
	
	box_result.style.width = canvas.clientWidth + "px";
	box_result.style.marginLeft = canvas.style.marginLeft;
	p_first.style.width = (canvas.clientWidth * 0.9) / 2 + "px";
	p_second.style.width = (canvas.clientWidth * 0.9) / 2 + "px";
	let padding_top =  canvas.clientWidth * 0.06;
	let padding_left = canvas.clientWidth * 0.05;
	p_first.style.paddingTop = padding_top + "px";
	p_second.style.paddingTop = padding_top + "px";
	double_point.style.paddingTop = padding_top + "px";
	p_first.style.paddingLeft = padding_left + "px";
	p_second.style.paddingRight = padding_left + "px";
	console.log("--------- resize Canvas: ", canvas.style.height, " ", canvas.style.width);
	moveCamera(statePongGame);
}

export async function loadPopupReply() {
	if (!html_popup_replay) {
		html_popup_replay = document.createElement('div');
		html_popup_replay.innerHTML = await loadHTML('./pong-game/public/popup_replay.html')
	}
	const data = game_data;
	let winner = (data.player1_score <= data.player2_score) ? data.player2_name : data.player1_name;
	html_popup_replay.querySelector('.overlay-text').textContent =  winner + " win";
	const container = document.querySelector('.p_container');
	container.appendChild(html_popup_replay);
	await loadReplayDocument();
	replay.addEventListener("click", replayLocalGame);
	pong_menu.addEventListener("click", fnGameOver);
}

export async function pongLoader() {
	if (!html_pong_loader) {
		html_pong_loader = document.createElement('div');
		html_pong_loader.innerHTML = await loadHTML('./pong-game/public/pong_loader.html');
	}
	const container = document.querySelector('.p_container');
	container.appendChild(html_pong_loader);

}

async function removePongLoader() {
	const container = document.querySelector('.p_container');
	container.removeChild(html_pong_loader);
}

export async function loadPopupGameOver() {
	if (!html_popup_game_over) {
		html_popup_game_over = document.createElement('div');
		html_popup_game_over.innerHTML = await loadHTML('./pong-game/public/popup_game_over.html');
	}
	const data = game_data ;
	console.log("----data-----: ", data);
	let winner = (data.player1_score <= data.player2_score) ? data.player2_name : data.player1_name;
	html_popup_game_over.querySelector('.overlay-text').textContent =  winner + " win";
	const container = document.querySelector('.p_container');
	container.appendChild(html_popup_game_over);
	await loadQuitDocument();
	pong_menu.addEventListener("click", fnGameOver);
}

async function removePopupReplay() {
	const container = document.querySelector('.p_container');
	console.log("html_popup_replay: ", html_popup_replay);
	html_popup_replay && container.removeChild(html_popup_replay);
}

async function assignPlayers({player1_name, player2_name}) {
	first_player_name.innerHTML = player1_name;
	second_player_name.innerHTML = player2_name;
}

export async function replayLocalGame() {
	(statePongGame == "local") ? await localgame() : await aiGame();
	await loadDocument();
	initGameVariable();
	initPaddleInstance();
	resizeCanvas();
	// back_counter.style.display = 'none';
	// popup_replay.style.display = 'none';
	removePopupReplay();
	leftPaddle();
	await connectLocalGameSocket();
	await descounter();
}

async function handleRelodQuit(event) {
	(statePongGame != "remote") ?
	await sendScore() :
	await sendLoserScore();
	// closeGameSocket();
	// event.preventDefault();
}

async function handleHashChange() {
	(statePongGame != "remote") ?
	await sendScore() :
	await sendLoserScore();
	await closeGameSocket();
	await fnGameOver();
}


async function handleTournamentRelodQuit(event) {
	console.log("-------------------handleTournamentRelodQuit ---------------");
	await cancelTournamentMatch();
	// event.preventDefault();
	// closeGameSocket();
}

async function handleTournamentHashChange() {
	console.log("-------------------handleTournamentHashChange ---------------");
	await cancelTournamentMatch();
	await closeGameSocket();
	await fnGameOver();
}

export function setupEventListeners() {
	window.addEventListener('resize', resizeCanvas);
	document.addEventListener("keydown", keyDownHandler, false);
	document.addEventListener("keyup", keyUpHandler, false);
	if (statePongGame !== "tournament") {
		window.addEventListener("beforeunload", handleRelodQuit);
		window.addEventListener("hashchange", handleHashChange);
	}
	else {
		window.addEventListener("beforeunload", handleTournamentRelodQuit);
		window.addEventListener("hashchange", handleTournamentHashChange);
	}

	
	// if (statePongGame == "local" || statePongGame == "ai_bot") {
	// 	replay.addEventListener("click", replayLocalGame);
	// 	pong_menu.addEventListener("click", fnGameOver);
	// }
	if (statePongGame == "remote") {
		setMousePositionHelper();
		window.addEventListener('mousemove', setMousePosition);
	}
	console.log("-- setupEventListeners ==>", statePongGame);
}

export function removeEventsListener() {
	(replay) && replay.removeEventListener("click", replayLocalGame);
	(pong_menu) && pong_menu.removeEventListener("click", fnGameOver);
	window.removeEventListener('resize', resizeCanvas);
	document.removeEventListener("keydown", keyDownHandler);
	document.removeEventListener("keyup", keyUpHandler);
	window.removeEventListener('mousemove', setMousePosition);
	window.removeEventListener('beforeunload', handleRelodQuit);
	window.removeEventListener("hashchange", handleHashChange);
	window.removeEventListener('beforeunload', handleTournamentRelodQuit);
	window.removeEventListener("hashchange", handleTournamentHashChange);

}


export async function descounter() {
	back_counter.style.display = 'flex';
	let n = 0;
	while (!startGame && !end_game) {
		if (n%4 == 0)
			counter.textContent = "Loading.." + (n / 4).toString();
		await sleep(0.25);
		if (n / 4 >= 3)
			await sendSocket();
		n++;
	}
	back_counter.style.display = 'none';
}

export async function loadPongGame() {
	console.log("------------loadPongGame-------");
	back_counter.style.display = 'flex';
	let n = 0;
	while (!startGame && !end_game) {
		if (n%4 == 0)
			counter.textContent = "Loading.." + (n / 4).toString();
		if (n >= 120) {
			await sendWinnerScore();
			await showWinner();
			break;
		}
		await sleep(0.25);
		n++;
	}
	back_counter.style.display = 'none';
}

function initGame() {
	removePopupReplay();
	(statePongGame === "remote") ? assignPlayers(game_data) : assignPlayers(game_data); 
	initGameComponents();
}

let replayGame = async () => {
	await loadDocument();
	initGameVariable();
	initPaddleInstance();
	initGame();
	resizeCanvas();
	lancePongGame();
	if (statePongGame == "remote"){
		await connectPaddleSocket();
		loadPongGame();
	}
	else {
		leftPaddle();
		await connectLocalGameSocket();
		await descounter();
	}
	resizeCanvas();
}

let lanceGame = async () => {
	console.log("------ lanceGame ==>>>", statePongGame);
	await replayGame();
}

initPlayGame(lanceGame);
replayGame();