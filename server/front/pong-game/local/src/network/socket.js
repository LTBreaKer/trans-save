import { lpaddle, rpaddle } from '../components/paddle.js'
import { sphere } from '../components/sphere.js'
import { leftPaddle, rightPaddle, paddle_way, TABLE_HEIGHT, BALL_RADUIS } from '../utils/globaleVariable.js';
import { TABLE_DEPTH, TABLE_WIDTH, PADDLE_LONG, height, width, first_player_goal, second_player_goal} from '../utils/globaleVariable.js';
import { getCookie } from '../utils/cookie.js';
// import {gameSocket} from '../main3d.js';

let gameSocket;
window.env = {
	DJANGO_HOSTNAME : "c3r4p5.1337.ma"
};

export async function connectBallSocket(group_name) {
	console.log("group name: ", group_name);
	try {
		// const wssUrl = "ws://" + window.env.DJANGO_HOSTNAME + ":9009/ws/pong_game/";
		const wssUrl = "ws://127.0.0.1:9009/ws/pong_game/";
		let ws;
		ws = new WebSocket(wssUrl);
		ws.onopen = (event) =>
				console.log('game WebSocket conection established.');
		ws.onmessage = (event) => {
			const message = JSON.parse(event.data);
			console.log("message: ", message);
			if (message.type === "draw_info") {
				const data_ball = JSON.parse(message.ball);
				const data_right_paddle = JSON.parse(message.right_paddle);
				const data_left_paddle = JSON.parse(message.left_paddle);
				if (data_ball.ballOut > 10){
					let r = (data_ball.ballOut - 10)/ 50
					sphere.position.z -= r * Math.abs(((data_ball.y * TABLE_WIDTH) / height)) + Math.abs(((data_ball.y * TABLE_WIDTH) / height));
					sphere.position.x += (1 - r) * ((data_ball.y * TABLE_WIDTH) / height);
					sphere.position.y += (1 - r) * ((data_ball.x * TABLE_DEPTH) / width);
				}
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
		}
		return (ws);
	} catch (error) {
		console.error('error: ', error)
	}
}
