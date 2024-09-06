import * as THREE from 'three';
import {canvas, click, TABLE_WIDTH, paddleHeight, height, box_result, first_player_goal, second_player_goal} from '../utils/globaleVariable.js';
import { lpaddle, rpaddle } from '../game/paddle.js';
// import { setPointerMouse} from '../game/staduim.js'
import { rotateTable, zoomCamera } from '../game/staduim.js'
// import { setPointerMouse, rotateTable, zoomCamera } from '../game/staduim.js'
import { connectBallSocket } from '../network/socket.js';
import { connectAI, connectPaddleSocket, launchGame } from '../game/game.js';
import {sendSocket} from '../game/game.js'
import { paddleSocket } from '../game/game.js';
import { connectGame , connect_ai} from '../utils/globaleVariable.js';
import { moveCamera } from '../components/camera.js';
 
function resizeCanvas(){
	let minHW = Math.min(window.innerWidth*0.99, window.innerHeight*0.99);
	canvas.style.width = (minHW - 100) + "px";
	canvas.style.height = (minHW - 100) + "px";
	canvas.style.marginTop = ((0.99 * window.innerHeight - minHW) * 0.5) + "px";
	canvas.style.marginLeft = ((0.99 * window.innerWidth - minHW) / 2) + "px";
	canvas.style.marginBottom = (0.01 * window.innerHeight) + "px";
	console.log("11 canvas.style.marginLeft: ", canvas.style.marginLeft);
	console.log("11 box_result.style.width: ", box_result.style.width);
	
	box_result.style.width = canvas.clientWidth + "px";
	box_result.style.marginLeft = canvas.style.marginLeft;
	console.log("12 box_result.style.width: ", box_result.style.width);
	first_player_goal.style.width = (canvas.clientWidth * 0.9) / 2 + "px";
	second_player_goal.style.width = (canvas.clientWidth * 0.9) / 2 + "px";
	let padding_top =  canvas.clientWidth * 0.06;
	let padding_left = canvas.clientWidth * 0.05;
	first_player_goal.style.paddingTop = padding_top + "px";
	first_player_goal.style.paddingLeft = padding_left + "px";
	second_player_goal.style.paddingTop = padding_top + "px";
	second_player_goal.style.paddingRight = padding_left + "px";
	// margin-bottom: 1%;
}

export function setupEventListeners() {
	console.log("setup event listener");
	window.addEventListener('resize', () => {
		// console.log("")
		resizeCanvas();
		moveCamera();
	})
	window.addEventListener('mousemove', rotateTable);
	window.addEventListener('wheel', zoomCamera);
	// document.addEventListener("mouseup", () => setPointerMouse(-99999999))
	// document.addEventListener("mousedown", (e) => {
	// 	setPointerMouse(e.clientY);
	// })

	document.querySelector("#runButton").addEventListener("click", () => {
		sendSocket();
		launchGame();
	})

	connectGame.addEventListener("click", () => {
		connectPaddleSocket();
		// console.log("hello");
	})

	connect_ai.addEventListener("click", () => {
		connectAI();
	})
	canvas.clientWidth
canvas.clientWidth
	const login_button = document.querySelector("#login");
	login_button.addEventListener("click", login);

	document.addEventListener("keydown", keyDownHandler, false);
	document.addEventListener("keyup", keyUpHandler, false);

	function keyDownHandler(e) {
		console.log(e.key);
		if (e.key === "Right" || e.key === "ArrowUp")
			rpaddle.rightPressed = true;
		else if (e.key === "Left" || e.key === "ArrowDown")
			rpaddle.leftPressed = true;
		if (e.key === "w" || e.key === "W")
			lpaddle.rightPressed = true;
		else if (e.key === "s" || e.key === "S")
			lpaddle.leftPressed = true;
	}
	
	function keyUpHandler(e) {
		if (e.key === "Right" || e.key === "ArrowUp")
			rpaddle.rightPressed = false;
		else if (e.key === "Left" || e.key === "ArrowDown")
			rpaddle.leftPressed = false;
		if (e.key === "w" || e.key === "W")
			lpaddle.rightPressed = false;
		else if (e.key === "s" || e.key === "S")
			lpaddle.leftPressed = false;
	}
	  
}
