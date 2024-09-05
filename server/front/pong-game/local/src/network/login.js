import { getCookie } from "../utils/cookie.js";

export function login() {
	const url = "http://localhost:8080/server/auth/users/me/";
	// const url = "http://"+ window.env.DJANGO_HOSTNAME +":8080/server/auth/users/me/";
	console.log("login")
	const req = fetch(url, {
		method: 'GET',
		headers: {
			'Authorization': `JWT ${getCookie("jwt_token")}`
		}
	});
	req.then((res) => {
		if (!res.ok)
			throw new Error(`HTTP error: ${res.status}`);
		return res.json();
	})
	.then((data) => {
		console.log(data);
	})
	.catch((error) => { console.error(`Could not get players: ${error}`) });
}

export async function listUsers() {
	// const url = "http://"+ window.env.DJANGO_HOSTNAME +":8080/server/player/gamer/";
	const url = "http://localhost:8080/server/player/gamer/";
	console.log("list users")
	const req = await fetch(url, {
		method: 'GET',
	});
	const result = await req.json();
	console.log("result: ", result);
	return (result);
}