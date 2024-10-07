import { lpaddle, rpaddle } from '../components/paddle.js'
import { sphere } from '../components/sphere.js'
import { leftPaddle, rightPaddle, paddle_way, TABLE_HEIGHT, BALL_RADUIS, popup_replay, sleep } from '../utils/globaleVariable.js';
import { TABLE_DEPTH, TABLE_WIDTH, PADDLE_LONG, height, width, first_player_goal, second_player_goal} from '../utils/globaleVariable.js';
// import {gameSocket} from '../main3d.js';
import  {gameApi, statePongGame } from '../../../../components/ping/script.js'
import { descounter, removeEventsListener } from './events.js';
import { data_remote_player, initPlayRemoteGame, sendPlayerPaddleCreated } from '../../../components/ping/script.js';
import { animationFrameId, launchGame, playRemotePongGame } from '../game/game.js';
import { moveCamera } from '../components/camera.js';
import { renderer } from '../components/renderer.js';
import { scene } from '../components/scene.js';
import { disposeScene } from '../components/disposeComponent.js';
// import { data_remote_player,  sendPlayerPaddleCreated } from '../../../components/ping/script.js';
// console.log("game API: ", gameApi);
let gameSocket;
window.env = {
	DJANGO_HOSTNAME : "c3r4p5.1337.ma"
};

function sendScore(left_paddle_score, right_paddle_score) {
	const url = "https://127.0.0.1:9006/api/gamedb/add-game-score/";
	// const url = "http://"+ window.env.DJANGO_HOSTNAME +":8080/server/auth/users/me/";
	let data;
	if (statePongGame == "local" || statePongGame == "ai_bot")
		data = JSON.parse(gameApi);
	else
		data = data_remote_player;
	data.player1_score = left_paddle_score;
	data.player2_score = right_paddle_score;
	const urlEncodedData = new URLSearchParams(data);
	const req = fetch(url, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${localStorage.getItem("token")}`,
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: urlEncodedData
	});
	req.then((res) => {
		if (!res.ok)
			throw new Error(`HTTP error: ${res.status}`);
		return res.json();
	})
	.then(data => console.log(data))
	.catch(error => console.error(`Could not get players: ${error}`));
}

function draw_info(data) {
	const data_ball = JSON.parse(data.ball);
	const data_right_paddle = JSON.parse(data.right_paddle);
	const data_left_paddle = JSON.parse(data.left_paddle);
	if (data_ball.ballOut > 10 && data_ball.ballOut != 59){
		let r = (data_ball.ballOut - 10)/ 50
		sphere.position.z -= r * (Math.abs((data_ball.y * TABLE_WIDTH) / height)
			+ Math.abs((data_ball.x * TABLE_DEPTH) / width));
		sphere.position.x += (1 - r) * ((data_ball.y * TABLE_WIDTH) / height);
		sphere.position.y += (1 - r) * ((data_ball.x * TABLE_DEPTH) / width);
	}
	else if (data_ball.ballOut == 59 && data_right_paddle.nb_goal < 3 && data_left_paddle.nb_goal < 3)
		descounter();
	else {
		sphere.position.x = ((data_ball.y - (height / 2)) * (TABLE_WIDTH / 2)) / (height / 2);
		sphere.position.y = ((data_ball.x - (width / 2)) * (TABLE_DEPTH / 2)) / (width / 2);
		sphere.position.z = TABLE_HEIGHT / 2 + BALL_RADUIS;
	}
	lpaddle.position.x = ((data_left_paddle.y - (height / 2)) * (TABLE_WIDTH / 2)) / (height / 2) + PADDLE_LONG / 2;
	rpaddle.position.x = ((data_right_paddle.y - (height / 2)) * (TABLE_WIDTH / 2)) / (height / 2) + PADDLE_LONG / 2;
	first_player_goal.innerHTML = data_right_paddle.nb_goal;
	second_player_goal.innerHTML = data_left_paddle.nb_goal;
}

export function fnGameOver(state = "rtn_menu") {
	popup_replay.style.display = 'flex';
	cancelAnimationFrame(animationFrameId);
	if (renderer) renderer.dispose();
	if (scene) disposeScene();
	removeEventsListener();
	window.location.hash = "/ping"
	// if (state == "rtn_menu")
}

// export function fnLocalGameOver() {

// }


export async function localGameSocket(group_name) {
	console.log("group name: ", group_name);
	try {
		// const wssUrl = "ws://" + window.env.DJANGO_HOSTNAME + ":9009/ws/pong_game/";
		const wssUrl = "ws://127.0.0.1:9009/ws/local_pong_game/";
		let ws = new WebSocket(wssUrl);
		ws.onopen = (event) => console.log('local game WebSocket conection established.');
		ws.onmessage = (event) => {
			const message = JSON.parse(event.data);
			if (message.type === "draw_info")
				draw_info(message);
			else if (message.type === "game_over") {
				sendScore(message.left_paddle_score, message.right_paddle_score);
				popup_replay.style.display = 'flex';
			}
		}
		return (ws);
	} catch (error) {
		console.error('error: ', error)
	}
}

function choicePaddle({name_current_user, player1name}) {
	(name_current_user === player1name) ? leftPaddle() : rightPaddle();
	console.log("=============> choicePaddle <================");
	console.log("name_current_user: ", name_current_user);
	console.log("player1name: ", player1name);
	console.log("paddle_way: ", paddle_way);
	moveCamera(statePongGame);
	return (name_current_user === player1name) ? ("left_paddle") : ("right_paddle");
}

export async function paddleSocket(group_name) {
	console.log("group name: ", group_name);
	try {
		// const wssUrl = "ws://" + window.env.DJANGO_HOSTNAME + ":9009/ws/pong_game/";
		const wssUrl = "ws://127.0.0.1:9009/ws/paddle_pong_game/";
		let ws = new WebSocket(wssUrl);
		ws.onopen = async (event) => {
			console.log('paddle game WebSocket conection established.');
			await ws.send(JSON.stringify({'type_msg': 'add_group', 'group_name': data_remote_player.game_id}));
			await ws.send(JSON.stringify({'type_msg': 'assigning_paddle', 'paddle': choicePaddle(data_remote_player)}));
			await sendPlayerPaddleCreated();
		}
		ws.onmessage = (event) => {
			const message = JSON.parse(event.data);
			if (message.type_msg === "draw_info")
				draw_info(message);
			else if (message.type_msg === "game_over") {
				console.log("message: ", message);
				fnGameOver("rtn_menu");
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
			await ws.send(JSON.stringify({'type_msg': 'add_group', 'group_name': data_remote_player.game_id}));
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
	back_counter.style.display = 'flex';
	for(let c=3; c > 0; c--) {
		counter.textContent = c;
		await sleep(1);
	}
	back_counter.style.display = 'none';
	playRemotePongGame();
	launchGame();
}