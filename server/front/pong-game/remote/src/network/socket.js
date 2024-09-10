import { lpaddle, rpaddle } from '../components/paddle.js'
import { sphere } from '../components/sphere.js'
import { leftPaddle, rightPaddle, paddle_way, TABLE_HEIGHT, BALL_RADUIS } from '../utils/globaleVariable.js';
import {paddle} from '../game/paddle.js'
import {camera} from '../components/camera.js'
import { TABLE_DEPTH, TABLE_WIDTH, PADDLE_LONG, height, width, first_player_goal, second_player_goal} from '../utils/globaleVariable.js';
import { getCookie } from '../utils/cookie.js';
// import {gameSocket} from '../main3d.js';

let gameSocket;
window.env = {
	DJANGO_HOSTNAME : "c3r4p5.1337.ma"
};

async function connectBallSocket(group_name) {
	console.log("group name: ", group_name);
	try {
		const wssUrl = "ws://" + window.env.DJANGO_HOSTNAME + ":8080/wss/start/" + group_name + "/";
		// const wssUrl = "ws://" + window.env.DJANGO_HOSTNAME + ":8080/wss/start/g1/";
		let ws;
		ws = new WebSocket(wssUrl);
		ws.onopen = (event) =>
				console.log('game WebSocket conection established.');
		ws.onmessage = (event) => {
			const message = JSON.parse(event.data);
			if (message.type_msg === "create_ball_socket") {
				// gameSocket = connectToWebSocket();
				ws.send(JSON.stringify({'type_msg': 'move'}));
			}
		}
		return (ws);
	} catch (error) {
		console.error('error: ', error)
	}
}

export async function connectToWebSocket() {
	try {
		const wssUrl = "wss://127.0.0.1:9009/g1/";
		const ws = new WebSocket(wssUrl);
		ws.onopen = (event) => {
			console.log('WebSocket conection established.');
			// const message = {'type': 'login', 'token': getCookie("jwt_token")};
			let message = {'type': ''}
			ws.send(JSON.stringify(message));
		}
		ws.onmessage = (event) => {
			const message = JSON.parse(event.data);
			console.log('Receive message: ', message);
		}
		return (ws);
	} catch (error) {
		console.log("error: ", error);
	}
}

// export async function connectToWebSocket() {
// 	try {
// 		const wssUrl = "ws://" + window.env.DJANGO_HOSTNAME + ":8080/wss/g1/?token=" + getCookie("jwt_token");
// 		let ws;
// 		ws = new WebSocket(wssUrl);
// 		ws.onopen = (event) =>
// 				console.log('WebSocket conection established.');
// 		ws.onmessage = (event) => {
// 			const message = JSON.parse(event.data);
// 			// console.log("message: ", message);
// 			if (message.type_msg === "init_paddle") {
// 				paddle.x = message.ps.x; 
// 				paddle.y = message.ps.y;
// 				if (paddle.x === 0) {
// 					rightPaddle();
// 					camera.position.y = -paddle_way * ((TABLE_DEPTH / 2) + 4.5);
// 					camera.lookAt(0, 0, 0 );
// 				}
// 				else {
// 					leftPaddle();
// 					camera.position.y = -paddle_way * ((TABLE_DEPTH / 2) + 4.5);
// 					camera.lookAt(0, 0, 0 );
// 					camera.rotation.z += Math.PI;
// 				}
// 				paddle.lastY = paddle.y;
// 			}
// 			else if (message.type_msg === "draw_info") {
// 				const data_ball = JSON.parse(message.ball);
// 				const data_right_paddle = JSON.parse(message.right_paddle);
// 				const data_left_paddle = JSON.parse(message.left_paddle);
// 				if (data_ball.ballOut > 10){
// 					let r = (data_ball.ballOut - 10)/ 50
// 					sphere.position.z -= r * Math.abs(((data_ball.y * TABLE_WIDTH) / height)) + Math.abs(((data_ball.y * TABLE_WIDTH) / height));
// 					sphere.position.x += (1 - r) * ((data_ball.y * TABLE_WIDTH) / height);
// 					sphere.position.y += (1 - r) * ((data_ball.x * TABLE_DEPTH) / width);
// 				}
// 				else {
// 						sphere.position.x = ((data_ball.y - (height / 2)) * (TABLE_WIDTH / 2)) / (height / 2);
// 						sphere.position.y = ((data_ball.x - (width / 2)) * (TABLE_DEPTH / 2)) / (width / 2);
// 						sphere.position.z = TABLE_HEIGHT / 2 + BALL_RADUIS;
// 					}
// 				lpaddle.position.x = ((data_left_paddle.y - (height / 2)) * (TABLE_WIDTH / 2)) / (height / 2) + PADDLE_LONG / 2;
// 				rpaddle.position.x = ((data_right_paddle.y - (height / 2)) * (TABLE_WIDTH / 2)) / (height / 2) + PADDLE_LONG / 2;
// 				first_player_goal.innerHTML = data_right_paddle.nb_goal;
// 				second_player_goal.innerHTML = data_left_paddle.nb_goal;
// 			}
// 			else if (message.message === "create_ball_socket")
// 				gameSocket = connectBallSocket(message.group_name);
// 			else if (message.message === "list_players")
// 				console.log('list player: ', message.players);
// 			else if (message.message == "invitation")
// 				receiveInvitation(message.user_name, message.channel_name, message.group_name)
// 				console.log("receive invitation: ", message);
// 		}
// 		return (ws);
// 	} catch (error) {
// 		console.error('error: ', error)
// 	}
// }