import { lpaddle, paddle, rpaddle } from "../game/paddle.js";

export async function keyDownHandler(e) {
	if (e.key === "Right" || e.key === "ArrowUp")
			rpaddle.rightPressed = true;
		else if (e.key === "Left" || e.key === "ArrowDown")
			rpaddle.leftPressed = true;
	if (e.key === "w" || e.key === "W")
			lpaddle.rightPressed = true;
		else if (e.key === "s" || e.key === "S")
			lpaddle.leftPressed = true;
	if (e.key === "Right" || e.key === "ArrowRight")
		paddle.leftPressed = true;
	else if (e.key === "Left" || e.key === "ArrowLeft")
		paddle.rightPressed = true;
}

export function keyUpHandler(e) {
	if (e.key === "Right" || e.key === "ArrowUp")
			rpaddle.rightPressed = false;
		else if (e.key === "Left" || e.key === "ArrowDown")
			rpaddle.leftPressed = false;
	if (e.key === "w" || e.key === "W")
		lpaddle.rightPressed = false;
	else if (e.key === "s" || e.key === "S")
		lpaddle.leftPressed = false;
	if (e.key === "Right" || e.key === "ArrowRight")
		paddle.leftPressed = false;
	else if (e.key === "Left" || e.key === "ArrowLeft")
		paddle.rightPressed = false;
}