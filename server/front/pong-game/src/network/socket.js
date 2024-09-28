import { lpaddle, rpaddle } from '../components/paddle.js'
import { sphere } from '../components/sphere.js'
import { leftPaddle, rightPaddle, paddle_way, TABLE_HEIGHT, BALL_RADUIS, popup_replay } from '../utils/globaleVariable.js';
import { TABLE_DEPTH, TABLE_WIDTH, PADDLE_LONG, height, width, first_player_goal, second_player_goal} from '../utils/globaleVariable.js';
// import {gameSocket} from '../main3d.js';
import  {gameApi, statePongGame } from '../../../../components/ping/script.js'
import { descounter } from './events.js';
import { data_remote_player } from '../../../components/ping/script.js';
// console.log("game API: ", gameApi);
let gameSocket;
window.env = {
	DJANGO_HOSTNAME : "c3r4p5.1337.ma"
};

function sendScore(left_paddle_score, right_paddle_score) {
	const url = "https://127.0.0.1:9006/api/gamedb/add-game-score/";
	// const url = "http://"+ window.env.DJANGO_HOSTNAME +":8080/server/auth/users/me/";
	const data = JSON.parse(gameApi);
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


export async function localGameSocket(group_name) {
	console.log("group name: ", group_name);
	try {
		// const wssUrl = "ws://" + window.env.DJANGO_HOSTNAME + ":9009/ws/pong_game/";
		const wssUrl = "ws://127.0.0.1:9009/ws/pong_game/";
		let ws = new WebSocket(wssUrl);
		ws.onopen = (event) => console.log('game WebSocket conection established.');
		ws.onmessage = (event) => {
			const message = JSON.parse(event.data);
			if (message.type === "draw_info")
				draw_info(message);
			else if (message.type === "game_over") {
				console.log("message: ", message);
				sendScore(message.left_paddle_score, message.right_paddle_score);
				popup_replay.style.zIndex = 100;
			}
			else
				console.log("else message: ", message);
		}
		return (ws);
	} catch (error) {
		console.error('error: ', error)
	}
}

function choicePaddle(name_current_user, player1_name) {
	return (name_current_user === player1_name) ? ("left_paddle") : ("right_paddle");
}

export async function paddleSocket(group_name) {
	console.log("group name: ", group_name);
	try {
		// const wssUrl = "ws://" + window.env.DJANGO_HOSTNAME + ":9009/ws/pong_game/";
		const wssUrl = "ws://127.0.0.1:9009/ws/remote_pong_game/";
		let ws = new WebSocket(wssUrl);
		ws.onopen = async (event) => {
			console.log('game WebSocket conection established.');
			await ws.send(JSON.stringify({'type_msg': 'add_group', 'group_name': data_remote_player.game_id}));
			await ws.send(JSON.stringify({'type_msg': 'assigning_paddle', 'paddle': choicePaddle(data_remote_player)}));
		}
		ws.onmessage = (event) => {
			const message = JSON.parse(event.data);
			if (message.type === "consumer_paddle_created")
				ws.send()
			if (message.type === "draw_info")
				draw_info(message);
			else if (message.type === "game_over") {
				console.log("message: ", message);
				sendScore(message.left_paddle_score, message.right_paddle_score);
				popup_replay.style.zIndex = 100;
			}
			else
				console.log("else message: ", message);
		}
		return (ws);
	} catch (error) {
		console.error('error: ', error)
	}
}
