import { game_data, statePongGame } from '../../../components/ping/script.js';
import {height, paddleHeight, paddle_way, width} from '../utils/globaleVariable.js'

class Paddle {
	constructor(x = 0) {
		this.rightPressed = false;
		this.leftPressed = false;
		this.x = x;
		this.y = height/2;
		this.lastY = this.y;
		this.nb_goal = 0;
	}

	right = () => { this.x = width - 10};
	left = () => { this.x = 0};

	update() {
		if (this.rightPressed)
			this.y = Math.max(Math.min(this.y - paddle_way * 5, height - paddleHeight), 0);
		else if (this.leftPressed)
			this.y = Math.min(Math.max(this.y + paddle_way * 5, 0), height - paddleHeight);
	}
	
	//remote
	mouseUpdate(way) {
		way = Math.max(Math.min(way, height - paddleHeight), 0);
		if (way < this.y)
			this.y = Math.max(this.y - 5, way);
		else if (way > this.y)
			this.y = Math.min(this.y + 5, way);
	}

	cp_data(data) {
		this.x = data.x;
		this.y = data.y;
		this.nb_goal = data.nb_goal;
	}
	
	// coordonate() {
	// 	return ({"type_msg": "paddle", "ps": {'x': this.x, 'y': this.y} });
	// }
	coordonate() {
		return ({"ps": {'x': this.x, 'y': this.y}});
	}
}

export let paddle;
export let lpaddle;
export let rpaddle;
export let loser_score;

function playerChoicePaddle({name_current_user, player1_name}) {
	(name_current_user === player1_name) ? paddle.left() : paddle.right();
}

function loserScore() {
	let data = game_data;
	console.log("loserScore game_data: ", game_data);
	data.player1_score = (paddle.x == 0) ? 0 : 3;
	data.player2_score = (data.player1_score == 0) ? 3 : 0;
	loser_score = JSON.stringify(data);
	console.log("loserScore : ", loser_score);
}

export function initPaddleInstance() {
	paddle = new Paddle();
	if (statePongGame == "remote") {
		playerChoicePaddle(game_data);
		loserScore();
	}

	lpaddle = new Paddle(0);
	rpaddle = new Paddle(width - 10);
}