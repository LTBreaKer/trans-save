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

export let first_player_goal = document.querySelector("#first_player");
export let second_player_goal = document.querySelector("#second_player");
export let replay = document.querySelector('#replay');
export let pong_menu = document.querySelector('#pong_menu');
export let box_result = document.querySelector(".p_box_result");
export let canvas = document.querySelector('#c');
export let back_counter = document.querySelector('#back_counter');
export let counter = document.querySelector('#counter');
export let popup_replay = document.querySelector('.p_popup_replay');

export async function loadDocument() {
	first_player_goal = document.querySelector("#first_player");
	second_player_goal = document.querySelector("#second_player");
	replay = document.querySelector('#replay');
	pong_menu = document.querySelector('#pong_menu');
	box_result = document.querySelector(".p_box_result");
	canvas = document.querySelector('#c');
	back_counter = document.querySelector('#back_counter');
	counter = document.querySelector('#counter');
	popup_replay = document.querySelector('.p_popup_replay');
}

// export const connectGame = document.querySelector('#connect');
// export const connect_ai = document.querySelector('#connect_ai');
export const loader = new THREE.TextureLoader();

// export const reversePaddleDirection = () => {
// 	paddle_way *= -1;
// }
export const leftPaddle = () => {
	paddle_way = 1;
}
export const rightPaddle = () => {
	paddle_way = -1;
}

document.addEventListener("mouseup", (e) => {
	click = false;
})

document.addEventListener("mousedown", (e) => {
	click = true
})

export let sleep = (s) => new Promise(r => setTimeout(r, s*1000));