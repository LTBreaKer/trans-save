import * as THREE from 'three';

export const width = 720;
export const height = 360;
export const paddleHeight = 60;
export const paddleWidth = 10;
export const ballRaduis = 6;

export const TABLE_DEPTH = 0.012 * width;
export const TABLE_WIDTH = 0.007 * width;
export const TABLE_HEIGHT = 0.1;
export const BALL_RADUIS = ballRaduis * TABLE_WIDTH / height;
export const PADDLE_LONG = paddleHeight * TABLE_WIDTH / height;
export const PADDLE_WIDTH = paddleWidth * TABLE_DEPTH / width;
export const PADDLE_HEIGHT = 0.1;

export let paddle_way = 1;
export let click = false;

export const first_player_goal = document.querySelector("#first_player");
export const second_player_goal = document.querySelector("#second_player");
export const box_result = document.querySelector(".p_box_result");
export const canvas = document.querySelector('#c');
export const connectGame = document.querySelector('#connect');
export const connect_ai = document.querySelector('#connect_ai');
export const loader = new THREE.TextureLoader();

// export const reversePaddleDirection = () => {
// 	paddle_way *= -1;
// }
export const leftPaddle = () => {
	paddle_way = -1;
}
export const rightPaddle = () => {
	paddle_way = 1;
}

document.addEventListener("mouseup", (e) => {
	click = false;
})

document.addEventListener("mousedown", (e) => {
	click = true
})