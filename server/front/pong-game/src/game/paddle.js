import {height, paddleHeight, paddle_way, width} from '../utils/globaleVariable.js'

class Paddle {
	constructor(x, y, color) {
		this.rightPressed = false;
		this.leftPressed = false;
		this.x = x;
		this.y = y;
		this.lastY = y;
		this.color = color;
		this.nb_goal = 0;
	}
	
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

//remote
export const paddle = new Paddle();
//local
export const lpaddle = new Paddle(0, height/2);
export const rpaddle = new Paddle(width - 10, height/2);