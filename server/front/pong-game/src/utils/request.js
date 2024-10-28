import { check_access_token, get_localstorage } from "../../../auth.js";
import { game_data } from "../../../components/ping/script.js";
import { lpaddle, rpaddle } from "../game/paddle.js";


export async  function postRequest(url, body) {
	await check_access_token();
	try {
		const req = await fetch(url, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem("token")}`,
					'Content-Type': 'application/json',
					'Session-ID': get_localstorage('session_id')
				},
				credentials: 'include',
				body: body,
				keepalive: true
			});
			// if (!req.ok)
			// 	throw new Error(`HTTP error: ${req.status}`);
			return req;
	}
    
	catch {
		(error => console.error(`${error}`));
	}
}

export async function cancelTournamentMatch() {
	console.log("cancelTournamentMatch--------------> ",game_data);
    await postRequest("https://127.0.0.1:9008/api/tournament/cancel-match/", JSON.stringify(game_data))
}

// export async function sendScore(left_paddle_score = lpaddle.nb_goal, right_paddle_score = rpaddle.nb_goal) {
// 	if (!game_data)
// 		return ;
// 	left_paddle_score && (game_data.player1_score = left_paddle_score) ;
// 	right_paddle_score && (game_data.player2_score = right_paddle_score) ;
//     postRequest(url, JSON.stringify(game_data));

// }

// async function cancelTournamentMatch() {
// 	console.log("cancelTournamentMatch--------------> ",game_data);
// 	const req = fetch(url, {
// 		method: 'POST',
// 		headers: {
// 			'Authorization': `Bearer ${localStorage.getItem("token")}`,
// 			'Content-Type': 'application/json',
// 			'Session-ID': get_localstorage('session_id')
// 		},
// 		credentials: 'include',
// 		body: JSON.stringify(game_data),
// 		keepalive: true
// 	});
// 	req.then((res) => {
// 		if (!res.ok)
// 			throw new Error(`HTTP error: ${res.status}`);
// 		return res.json();
// 	})
// 	.then(data => console.log(data))
// 	.catch(error => console.error(`${error}`));
// }


// export async function sendScore(left_paddle_score = lpaddle.nb_goal, right_paddle_score = rpaddle.nb_goal) {
// 	if (!game_data)
// 		return ;
// 	left_paddle_score && (game_data.player1_score = left_paddle_score) ;
// 	right_paddle_score && (game_data.player2_score = right_paddle_score) ;
// 	const req = fetch(url, {
// 		method: 'POST',
// 		headers: {
// 			'Authorization': `Bearer ${localStorage.getItem("token")}`,
// 			'Content-Type': 'application/json',
// 			'Session-ID': get_localstorage('session_id')
// 		},
// 		credentials: 'include',
// 		body: JSON.stringify(game_data),
// 		keepalive: true

// 	});
// 	req.then((res) => {
// 		if (!res.ok)
// 			throw new Error(`HTTP error: ${res.status}`);
// 		return res.json();
// 	})
// 	.catch(error => console.error(`${error}`));
// }