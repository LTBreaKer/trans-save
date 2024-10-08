import { lpaddle, paddle, rpaddle } from "../game/paddle.js";

export function keyDownHandler(e) {
	if (e.key === "Right" || e.key === "ArrowUp")
		lpaddle.leftPressed = true;
	else if (e.key === "Left" || e.key === "ArrowDown")
		lpaddle.rightPressed = true;
	if (e.key === "w" || e.key === "W")
		rpaddle.leftPressed = true;
	else if (e.key === "s" || e.key === "S")
		rpaddle.rightPressed = true;
	if (e.key === "Right" || e.key === "ArrowRight")
		paddle.leftPressed = true;
	else if (e.key === "Left" || e.key === "ArrowLeft")
		paddle.rightPressed = true;
}

export function keyUpHandler(e) {
	if (e.key === "Right" || e.key === "ArrowUp")
		lpaddle.leftPressed = false;
	else if (e.key === "Left" || e.key === "ArrowDown")
		lpaddle.rightPressed = false;
	if (e.key === "w" || e.key === "W")
		rpaddle.leftPressed = false;
	else if (e.key === "s" || e.key === "S")
		rpaddle.rightPressed = false;
	if (e.key === "Right" || e.key === "ArrowRight")
		paddle.leftPressed = false;
	else if (e.key === "Left" || e.key === "ArrowLeft")
		paddle.rightPressed = false;
}