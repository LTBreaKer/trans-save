
import {canvas, box_result, counter, replay, pong_menu, loadDocument, sleep, back_counter, leftPaddle, first_player_name, second_player_name, p_second, p_first, loadReplayDocument, loadQuitDocument, double_point} from '../utils/globaleVariable.js';
import { connectLocalGameSocket, connectPaddleSocket, end_game, initGameVariable, startGame, sendSocket, endGameConnection } from '../game/game.js';
import { moveCamera } from '../components/camera.js';
import { initPaddleInstance } from '../game/paddle.js';
import { keyDownHandler, keyUpHandler } from '../events/keyboardEvent.js';
import { aiGame, game_data, localgame, statePongGame } from '../../../components/ping/script.js';
import { initPlayGame } from '../../../components/pingpong/ping.js';
import { lancePongGame } from '../main3d.js';
import { setMousePosition, setMousePositionHelper } from '../events/mouseEvent.js';
import { initGameComponents } from '../components/renderer.js';
import { fnGameOver, showWinner } from './socket.js';
import { loadHTML } from '../../../utils.js';
let html_popup_replay;
let html_popup_game_over;

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

export async function loadPopupGameOver(disconnected = false) {
	if (!html_popup_game_over) {
		html_popup_game_over = document.createElement('div');
		html_popup_game_over.innerHTML = await loadHTML('./pong-game/public/popup_game_over.html');
	}
	const data = game_data ;
	console.log("----data-----: ", data);
	let winner = (data.player1_score <= data.player2_score) ? data.player2_name : data.player1_name;
	html_popup_game_over.querySelector('.overlay-text').textContent = winner + " win";
	if (disconnected) html_popup_game_over.querySelector('.overlay-text').textContent =  "Game Disconnected";
	const container = document.querySelector('.p_container');
	container.appendChild(html_popup_game_over);
	await loadQuitDocument();
	pong_menu.addEventListener("click", fnGameOver);
}

async function removePopupReplay() {
	const container = document.querySelector('.p_container');
	console.log("html_popup_replay: ", html_popup_replay);
	if (html_popup_replay && container.contains(html_popup_replay))
		container.removeChild(html_popup_replay);
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
	removePopupReplay();
	leftPaddle();
	await connectLocalGameSocket();
	await descounter();
}

async function handleHashChange() {
	endGameConnection();
	await fnGameOver();
}

async function handleTournamentHashChange() {
	console.log("-------------------handleTournamentHashChange ---------------");
	endGameConnection();
	await fnGameOver();
}

export function setupEventListeners() {
	window.addEventListener('resize', resizeCanvas);
	document.addEventListener("keydown", keyDownHandler, false);
	document.addEventListener("keyup", keyUpHandler, false);
	if (statePongGame !== "tournament")
		window.addEventListener("hashchange", handleHashChange);
	else
		window.addEventListener("hashchange", handleTournamentHashChange);
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
	window.removeEventListener("hashchange", handleHashChange);
	window.removeEventListener("hashchange", handleTournamentHashChange);
}


export async function descounter() {
	back_counter.style.display = 'flex';
	let n = 0;
	while (!startGame && !end_game && !end_game) {
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
	while (!startGame && !end_game && !end_game) {
		if (n%4 == 0)
			counter.textContent = "Loading.." + (n / 4).toString();
		if (n >= 120) {
			await showWinner(true);
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
	initGameVariable();
	await loadDocument();
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

let lanceGame = async () => { await replayGame() }

initPlayGame(lanceGame);
replayGame();