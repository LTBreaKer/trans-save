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

export function initPaddleInstance() {
	paddle = new Paddle();
	lpaddle = new Paddle(0);
	rpaddle = new Paddle(width - 10);
}