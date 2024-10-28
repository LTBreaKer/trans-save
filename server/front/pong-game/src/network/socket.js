import { lpaddle, rpaddle } from '../components/paddle.js'
import { sphere } from '../components/sphere.js'
import { leftPaddle, rightPaddle, paddle_way, TABLE_HEIGHT, BALL_RADUIS, popup_replay, sleep, back_counter, replay, pong_menu, loadReplayDocument, goals_to_win } from '../utils/globaleVariable.js';
import { TABLE_DEPTH, TABLE_WIDTH, PADDLE_LONG, height, width, first_player_goal, second_player_goal} from '../utils/globaleVariable.js';
import  {statePongGame } from '../../../../components/ping/script.js'
import {  descounter, loadPongGame, loadPopupGameOver, loadPopupReply, removeEventsListener, replayLocalGame } from './events.js';
import { assingGameApiToNULL, game_data, initPlayRemoteGame, sendPlayerPaddleCreated } from '../../../components/ping/script.js';
import { animationFrameId, closeGameSocket, endGameConnection, launchGame, playRemotePongGame, sendSocket, stopGame } from '../game/game.js';
import { moveCamera } from '../components/camera.js';
import { renderer } from '../components/renderer.js';
import { scene } from '../components/scene.js';
import { disposeScene } from '../components/disposeComponent.js';
import { endTournamentMatchScore } from '../../../components/tournamentscore/match_tournament.js';
import { tournament_match_data } from '../../../components/tournament/script.js';
import { loser_score, winner_score } from '../game/paddle.js';
import { postRequest } from '../utils/request.js';
const url = "https://127.0.0.1:9006/api/gamedb/add-game-score/";
window.env = {
	DJANGO_HOSTNAME : "c3r4p5.1337.ma"
};

export async function sendScore(left_paddle_score = lpaddle.nb_goal, right_paddle_score = rpaddle.nb_goal) {
	if (!game_data)
		return ;
	console.log("game_data.player1_score", game_data.player1_score);
	console.log("left_paddle_score", left_paddle_score);
	left_paddle_score && (game_data.player1_score = left_paddle_score) ;
	right_paddle_score && (game_data.player2_score = right_paddle_score) ;
    postRequest(url, JSON.stringify(game_data));
	console.log("send game data: ", game_data);
}

function sendScoreWhenRefreshingPage() {
	postRequest(url, JSON.stringify(game_data));
}

export async function connectGame() {
	console.log("=====connect Game: ");
	postRequest("https://127.0.0.1:9006/api/gamedb/connect-game/", JSON.stringify(game_data));
}

export async function sendLoserScore () {
	console.log("loser_score: ", loser_score);
	postRequest(url, loser_score);
}

export async function sendWinnerScore () {
	console.log("loser_score: ", winner_score);
	postRequest(url, winner_score);
}

async function draw_info(data) {
	if (!game_data)
		return;
	// console.log("game_data: ", game_data);
	launchGame();
	const data_ball = JSON.parse(data.ball);
	const data_right_paddle = JSON.parse(data.right_paddle);
	const data_left_paddle = JSON.parse(data.left_paddle);
	game_data.player1_score = data_left_paddle.nb_goal;
	game_data.player2_score = data_right_paddle.nb_goal;
	lpaddle.nb_goal = data_left_paddle.nb_goal;
	rpaddle.nb_goal = data_right_paddle.nb_goal;
	if (data_ball.ballOut > 10 && data_ball.ballOut != 59){
		let r = (data_ball.ballOut - 10)/ 50
		sphere.position.z -= r * (Math.abs((data_ball.y * TABLE_WIDTH) / height)
			+ Math.abs((data_ball.x * TABLE_DEPTH) / width));
		sphere.position.x += (1 - r) * ((data_ball.y * TABLE_WIDTH) / height);
		sphere.position.y += (1 - r) * ((data_ball.x * TABLE_DEPTH) / width);
	}
	// else if (data_ball.ballOut == 60 && rpaddle.nb_goal < goals_to_win && lpaddle.nb_goal < goals_to_win) {
	else if (data_ball.endTurn && rpaddle.nb_goal < goals_to_win && lpaddle.nb_goal < goals_to_win) {
		console.log("data_ball.ballOut: ", data_ball.ballOut);
		stopGame();
		descounter();
		// loadPongGame();
		// await sendSocket();
	}
	else {
		sphere.position.x = ((data_ball.y - (height / 2)) * (TABLE_WIDTH / 2)) / (height / 2);
		sphere.position.y = ((data_ball.x - (width / 2)) * (TABLE_DEPTH / 2)) / (width / 2);
		sphere.position.z = TABLE_HEIGHT / 2 + BALL_RADUIS;
	}
	lpaddle.position.x = ((data_left_paddle.y - (height / 2)) * (TABLE_WIDTH / 2)) / (height / 2) + PADDLE_LONG / 2;
	rpaddle.position.x = ((data_right_paddle.y - (height / 2)) * (TABLE_WIDTH / 2)) / (height / 2) + PADDLE_LONG / 2;
	first_player_goal.innerHTML = lpaddle.nb_goal;
	second_player_goal.innerHTML = rpaddle.nb_goal;
}

export async function showWinner() {
	// stopGame();
	endGameConnection();
	await loadPopupGameOver();
}

export async function fnGameOver(state = "rtn_menu") {
	// stopGame();
	endGameConnection();
	removeEventsListener();
	cancelAnimationFrame(animationFrameId);
	(renderer) && renderer.dispose();
	(scene) && disposeScene();
	if (statePongGame !== "tournament")
		window.location.hash = "/ping"
	else {
		(tournament_match_data.matchNumber === 7) ?
		window.location.hash = "/ping" :
		window.location.hash = "/tournament";
	}
	assingGameApiToNULL();
}


export async function localGameSocket(group_name) {
	console.log("group name: ", group_name);
	try {
		// const wssUrl = "ws://" + window.env.DJANGO_HOSTNAME + ":9009/ws/pong_game/";
		const wssUrl = "ws://127.0.0.1:9009/ws/local_pong_game/";
		let ws = new WebSocket(wssUrl);
		ws.onopen = (event) => {console.log('local game WebSocket conection established.')};
		ws.onmessage = (event) => {
			const message = JSON.parse(event.data);
			if (message.type === "draw_info")
				draw_info(message);
			else if (message.type === "game_over") {
				console.log("statePongGame === tournament: ", statePongGame === "tournament");
				if (statePongGame === "tournament") {
					endTournamentMatchScore(message.left_paddle_score, message.right_paddle_score);
					game_data.player1_score = message.left_paddle_score;
					game_data.player2_score = message.right_paddle_score;
					showWinner();
				} else {
					sendScore(message.left_paddle_score, message.right_paddle_score);
					// stopGame();
					endGameConnection();
					// popup_replay.style.display = 'flex';
					loadPopupReply();
				}
			}
		}
		ws.onclose = (e) => {
			(statePongGame !== "tournament") && sendScoreWhenRefreshingPage();
		}
		return (ws);
	} catch (error) {
		console.error('error: ', error)
	}
}

function choicePaddle({name_current_user, player1_name}) {
	(name_current_user === player1_name) ? leftPaddle() : rightPaddle();
	console.log("=============> choicePaddle <================");
	console.log("name_current_user: ", name_current_user);
	console.log("player1_name: ", player1_name);
	console.log("paddle_way: ", paddle_way);
	moveCamera(statePongGame);
	return (name_current_user === player1_name) ? ("left_paddle") : ("right_paddle");
}

export async function paddleSocket(group_name) {
	console.log("group name: ", group_name);
	try {
		// const wssUrl = "ws://" + window.env.DJANGO_HOSTNAME + ":9009/ws/pong_game/";
		const wssUrl = "ws://127.0.0.1:9009/ws/paddle_pong_game/";
		let ws = new WebSocket(wssUrl);
		ws.onopen = async (event) => {
			console.log('paddle game WebSocket conection established.');
			ws.send(JSON.stringify({'type_msg': 'add_group', 'group_name': game_data.game_id}));
			ws.send(JSON.stringify({'type_msg': 'assigning_paddle', 'paddle': choicePaddle(game_data)}));
			// await sendPlayerPaddleCreated();
		}
		ws.onmessage = async (event) => {
			const message = JSON.parse(event.data);
			if (message.type_msg === "draw_info")
				draw_info(message);
			else if (message.type_msg === "game_over") {
				console.log("---------------------------------------message: ", message);
				game_data.player1_score = message.left_paddle_score;
				game_data.player2_score = message.right_paddle_score;
				console.log("message.left_paddle_score: ", message.left_paddle_score);
				console.log("game_data.player1_score: ", game_data.player1_score);
				console.log("game_data: ", game_data);
				showWinner();
			}
			else if (message.type_msg === "consumer_paddle_created")
				await sendPlayerPaddleCreated();
			else
				console.log("else message: ", message);
		}
		// ws.onclose = (e) => {
		// 	sendScoreWhenRefreshingPage();
		// }
		return (ws);
	} catch (error) {
		console.error('error: ', error)
	}
}

async function connectBallSocket() {
	try {
		const wssUrl = "ws://127.0.0.1:9009/ws/remote_pong_game/";
		// const wssUrl = "ws://" + window.env.DJANGO_HOSTNAME + ":8080/wss/start/g1/";
		let ws = new WebSocket(wssUrl);
		ws.onopen = async (event) => {
			console.log('remote game WebSocket conection established.');
			await ws.send(JSON.stringify({'type_msg': 'add_group', 'group_name': game_data.game_id}));
		}
		ws.onmessage = (event) => {
			const message = JSON.parse(event.data);
			console.log("remote game message:", message);
			if (message.type_msg === "create_ball_socket")
				ws.send(JSON.stringify({'type_msg': 'move'}));
			else if (message.type === "game_over")
				sendScore(message.left_paddle_score, message.right_paddle_score);
			else if (message.type_msg === "play")
				descounterRemoteGame();
		}
		return (ws);
	} catch (error) {
		console.error('error: ', error)
	}
}

initPlayRemoteGame(connectBallSocket);


async function descounterRemoteGame() {
	await sleep(3);
	await playRemotePongGame();
	launchGame();
}

// async function descounterRemoteGame() {
// 	// back_counter.style.display = 'flex';
// 	// for(let c=3; c > 0; c--) {
// 	// 	back_counter.textContent = c;
// 	// 	await sleep(1);
// 	// }
// 	// back_counter.style.display = 'none';
// 	await sleep(3);
// 	await playRemotePongGame();
// 	launchGame();
// }