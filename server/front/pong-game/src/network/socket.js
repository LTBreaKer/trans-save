import { lpaddle, rpaddle } from '../components/paddle.js'
import { sphere } from '../components/sphere.js'
import { leftPaddle, rightPaddle, paddle_way, TABLE_HEIGHT, BALL_RADUIS, popup_replay, sleep, back_counter, replay, pong_menu, loadReplayDocument } from '../utils/globaleVariable.js';
import { TABLE_DEPTH, TABLE_WIDTH, PADDLE_LONG, height, width, first_player_goal, second_player_goal} from '../utils/globaleVariable.js';
// import {gameSocket} from '../main3d.js';
import  {statePongGame } from '../../../../components/ping/script.js'
import { descounter, loadPongGame, loadPopupGameOver, loadPopupReply, removeEventsListener, replayLocalGame } from './events.js';
import { assingGameApiToNULL, game_data, initPlayRemoteGame, sendPlayerPaddleCreated } from '../../../components/ping/script.js';
import { animationFrameId, launchGame, playRemotePongGame, sendSocket, stopGame } from '../game/game.js';
import { moveCamera } from '../components/camera.js';
import { renderer } from '../components/renderer.js';
import { scene } from '../components/scene.js';
import { disposeScene } from '../components/disposeComponent.js';
import { endTournamentMatchScore } from '../../../components/tournamentscore/match_tournament.js';
import { loadHTML } from '../../../utils.js';
import { tournament_match_data } from '../../../components/tournament/script.js';
import { get_localstorage } from '../../../auth.js';
// import { game_data,  sendPlayerPaddleCreated } from '../../../components/ping/script.js';
// console.log("game API: ", gameApi);
let gameSocket;
let html_popup_replay;
window.env = {
	DJANGO_HOSTNAME : "c3r4p5.1337.ma"
};

export function sendScore(left_paddle_score = lpaddle.nb_goal, right_paddle_score = rpaddle.nb_goal) {
	const url = "https://127.0.0.1:9006/api/gamedb/add-game-score/";
	// const url = "http://"+ window.env.DJANGO_HOSTNAME +":8080/server/auth/users/me/";
	let data;
	data = game_data;
	data.player1_score = left_paddle_score;
	data.player2_score = right_paddle_score;
	const urlEncodedData = new URLSearchParams(data);
	const req = fetch(url, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${localStorage.getItem("token")}`,
			'Content-Type': 'application/x-www-form-urlencoded',
			'Session-ID': get_localstorage('session_id')
		},
		body: urlEncodedData
	});
	req.then((res) => {
		if (!res.ok)
			throw new Error(`HTTP error: ${res.status}`);
		return res.json();
	})
	.then(data => console.log(data))
	.catch(error => console.error(`${error}`));
}

async function draw_info(data) {
	launchGame();
	const data_ball = JSON.parse(data.ball);
	const data_right_paddle = JSON.parse(data.right_paddle);
	const data_left_paddle = JSON.parse(data.left_paddle);
	lpaddle.nb_goal = data_left_paddle.nb_goal;
	rpaddle.nb_goal = data_right_paddle.nb_goal;
	if (data_ball.ballOut > 10 && data_ball.ballOut != 59){
		let r = (data_ball.ballOut - 10)/ 50
		sphere.position.z -= r * (Math.abs((data_ball.y * TABLE_WIDTH) / height)
			+ Math.abs((data_ball.x * TABLE_DEPTH) / width));
		sphere.position.x += (1 - r) * ((data_ball.y * TABLE_WIDTH) / height);
		sphere.position.y += (1 - r) * ((data_ball.x * TABLE_DEPTH) / width);
	}
	// else if (data_ball.ballOut == 60 && rpaddle.nb_goal < 3 && lpaddle.nb_goal < 3) {
	else if (data_ball.endTurn && rpaddle.nb_goal < 3 && lpaddle.nb_goal < 3) {
		console.log("data_ball.ballOut: ", data_ball.ballOut);
		stopGame();
		loadPongGame();
		await sendSocket();
	}
		// descounter();
	else {
		sphere.position.x = ((data_ball.y - (height / 2)) * (TABLE_WIDTH / 2)) / (height / 2);
		sphere.position.y = ((data_ball.x - (width / 2)) * (TABLE_DEPTH / 2)) / (width / 2);
		sphere.position.z = TABLE_HEIGHT / 2 + BALL_RADUIS;
	}
	lpaddle.position.x = ((data_left_paddle.y - (height / 2)) * (TABLE_WIDTH / 2)) / (height / 2) + PADDLE_LONG / 2;
	rpaddle.position.x = ((data_right_paddle.y - (height / 2)) * (TABLE_WIDTH / 2)) / (height / 2) + PADDLE_LONG / 2;
	first_player_goal.innerHTML = rpaddle.nb_goal;
	second_player_goal.innerHTML = lpaddle.nb_goal;
}

export async function fnGameOver(state = "rtn_menu") {
	stopGame();
	console.log("state: ", state);
	if (state === "show winner")
		await loadPopupGameOver();
	else {
		removeEventsListener();
		cancelAnimationFrame(animationFrameId);
		if (renderer) renderer.dispose();
		if (scene) disposeScene();
		if (statePongGame !== "tournament")
			window.location.hash = "/ping"
		else {
			(tournament_match_data.matchNumber === 7) ?
			window.location.hash = "/ping" :
			window.location.hash = "/tournament";
		}
		assingGameApiToNULL();
	}
}

// export function fnLocalGameOver() {

// }



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
					fnGameOver("show winner");
				} else {
					sendScore(message.left_paddle_score, message.right_paddle_score);
					stopGame();
					// popup_replay.style.display = 'flex';
					loadPopupReply();
				}
			}
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
			await ws.send(JSON.stringify({'type_msg': 'add_group', 'group_name': game_data.game_id}));
			await ws.send(JSON.stringify({'type_msg': 'assigning_paddle', 'paddle': choicePaddle(game_data)}));
			await sendPlayerPaddleCreated();
		}
		ws.onmessage = (event) => {
			const message = JSON.parse(event.data);
			if (message.type_msg === "draw_info")
				draw_info(message);
			else if (message.type_msg === "game_over") {
				console.log("message: ", message);
				game_data.player1_score = message.left_paddle_score;
				game_data.player2_score = message.right_paddle_score;
				fnGameOver("show winner");
			}
			else
				console.log("else message: ", message);
		}
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
	// back_counter.style.display = 'flex';
	// for(let c=3; c > 0; c--) {
	// 	back_counter.textContent = c;
	// 	await sleep(1);
	// }
	// back_counter.style.display = 'none';
	await sleep(3);
	await playRemotePongGame();
	launchGame();
}