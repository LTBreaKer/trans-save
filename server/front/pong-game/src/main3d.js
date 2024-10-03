// import * as THREE from 'three';
// import WebGL from 'three/addons/capabilities/WebGL.js';
import { setupEventListeners} from './network/events.js';
import { animate } from './game/game.js';


// export let startGame = false;
// export let gameOver = false;
// document.cookie="jwt_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzE3ODU2MTU4LCJpYXQiOjE3MTc3Njk3NTgsImp0aSI6ImEwZWMxOTNiY2EwNTQ5NWU5ZDkzOTlkYjRhZDczYThkIiwidXNlcl9pZCI6MX0.GiJBHld9Rgo2OMQwq7LJgyMsPdNONTp5eded5K8vdrg";
// export async function fnPongGame() {
	// if ( WebGL.isWebGLAvailable() )
		// requestAnimationFrame( animate );
		// animate();
	// else {
	// 	const warning = WebGL.getWebGLErrorMessage();
	// 	document.getElementById( 'container' ).appendChild( warning );
	// }
	
	// setupEventListeners();
// }

export function lancePongGame(){
	console.log("-------------- lancePongGame")
	animate();
	setupEventListeners();
}

// lancePongGame();