import { lpaddle, rpaddle } from '../components/paddle.js'
import { sphere } from '../components/sphere.js'
import { leftPaddle, rightPaddle, paddle_way, TABLE_HEIGHT, BALL_RADUIS,  sleep, goals_to_win } from '../utils/globaleVariable.js';
import { TABLE_DEPTH, TABLE_WIDTH, PADDLE_LONG, height, width, first_player_goal, second_player_goal} from '../utils/globaleVariable.js';
import  {statePongGame } from '../../../../components/ping/script.js'
import {  descounter,  loadPopupGameOver, loadPopupReply, removeEventsListener, replayLocalGame } from './events.js';
import { assingGameApiToNULL, game_data, initPlayRemoteGame, sendPlayerPaddleCreated } from '../../../components/ping/script.js';
import { animationFrameId,  endGameConnection, game_connected, launchGame, playRemotePongGame, sendSocket, setGameConnected, stopGame } from '../game/game.js';
import { moveCamera } from '../components/camera.js';
import { renderer } from '../components/renderer.js';
import { scene } from '../components/scene.js';
import { disposeScene } from '../components/disposeComponent.js';
import { endTournamentMatchScore } from '../../../components/tournamentscore/match_tournament.js';
import { postRequest } from '../utils/request.js';
const url = "https://127.0.0.1:9006/api/gamedb/add-game-score/";
window.env = {
    DJANGO_HOSTNAME : "c3r4p5.1337.ma"
};

export async function connectGame() {
    console.log("=====connect Game: ");
    await postRequest("https://127.0.0.1:9006/api/gamedb/connect-game/", JSON.stringify(game_data));
    setGameConnected();
}

async function draw_info(data) {
    if (!game_data)
        return;
    // console.log("game_data: ", game_data);
    launchGame();
    const data_ball = JSON.parse(data.ball);
    const data_right_paddle = JSON.parse(data.right_paddle);
    const data_left_paddle = JSON.parse(data.left_paddle);
    game_data.player1_score = data_left_paddle.nb_goal;
    game_data.player2_score = data_right_paddle.nb_goal;
    lpaddle.nb_goal = data_left_paddle.nb_goal;
    rpaddle.nb_goal = data_right_paddle.nb_goal;
    if (data_ball.ballOut > 10 && data_ball.ballOut != 59){
        let r = (data_ball.ballOut - 10)/ 50
        sphere.position.z -= r * (Math.abs((data_ball.y * TABLE_WIDTH) / height)
            + Math.abs((data_ball.x * TABLE_DEPTH) / width));
        sphere.position.x += (1 - r) * ((data_ball.y * TABLE_WIDTH) / height);
        sphere.position.y += (1 - r) * ((data_ball.x * TABLE_DEPTH) / width);
    }
    // else if (data_ball.ballOut == 60 && rpaddle.nb_goal < goals_to_win && lpaddle.nb_goal < goals_to_win) {
    else if (data_ball.endTurn && rpaddle.nb_goal < goals_to_win && lpaddle.nb_goal < goals_to_win) {
        console.log("data_ball.ballOut: ", data_ball.ballOut);
        stopGame();
        descounter();
    }
    else {
        sphere.position.x = ((data_ball.y - (height / 2)) * (TABLE_WIDTH / 2)) / (height / 2);
        sphere.position.y = ((data_ball.x - (width / 2)) * (TABLE_DEPTH / 2)) / (width / 2);
        sphere.position.z = TABLE_HEIGHT / 2 + BALL_RADUIS;
    }
    lpaddle.position.x = ((data_left_paddle.y - (height / 2)) * (TABLE_WIDTH / 2)) / (height / 2) + PADDLE_LONG / 2;
    rpaddle.position.x = ((data_right_paddle.y - (height / 2)) * (TABLE_WIDTH / 2)) / (height / 2) + PADDLE_LONG / 2;
    first_player_goal.innerHTML = lpaddle.nb_goal;
    second_player_goal.innerHTML = rpaddle.nb_goal;
}

export async function showWinner(disconnected = false) {
    endGameConnection();
    await loadPopupGameOver(disconnected);
}

export async function fnGameOver(state = "rtn_menu") {
    removeEventsListener();
    cancelAnimationFrame(animationFrameId);
    (renderer) && renderer.dispose();
    (scene) && disposeScene();
    if (statePongGame !== "tournament")
        window.location.hash = "/ping"
    else
        window.location.hash = "/tournament";
    assingGameApiToNULL();
}

function userConnectionInfo() {
    let data = game_data;
    data.type_msg = 'add_user_data';
    data.statePongGame = statePongGame;
    // data.group_name = data_remote_player.game_id;
    data.token = localStorage.getItem("token");
    data.refresh = localStorage.getItem("refresh");
    data.session_id = localStorage.getItem("session_id");
    return (data);
}


export async function localGameSocket(group_name) {
    console.log("group name: ", group_name);
    try {
        // const wssUrl = "ws://" + window.env.DJANGO_HOSTNAME + ":9009/ws/pong_game/";
        const wssUrl = "ws://127.0.0.1:9009/ws/local_pong_game/";
        let ws = new WebSocket(wssUrl);
        ws.onopen = async (event) => {
            ws.send(JSON.stringify(userConnectionInfo()));
            console.log('local game WebSocket conection established.');
        };
        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === "draw_info")
                draw_info(message);
            else if (message.type === "game_over") {
                console.log("statePongGame === tournament: ", statePongGame === "tournament");
                if (statePongGame === "tournament") {
                    endTournamentMatchScore(message.left_paddle_score, message.right_paddle_score);
                    game_data.player1_score = message.left_paddle_score;
                    game_data.player2_score = message.right_paddle_score;
                    showWinner();
                } else
                    loadPopupReply();
            }
        }
        ws.onclose = (e) => { fnGameOver() }
        return (ws);
    } catch (error) {
        console.error('error: ', error)
    }
}

function choicePaddle({name_current_user, player1_name}) {
    (name_current_user === player1_name) ? leftPaddle() : rightPaddle();
    moveCamera(statePongGame);
    return (name_current_user === player1_name) ? ("left_paddle") : ("right_paddle");
}

export async function paddleSocket(group_name) {
    console.log("group name: ", group_name);
    try {
        // const wssUrl = "ws://" + window.env.DJANGO_HOSTNAME + ":9009/ws/pong_game/";
        const wssUrl = "ws://127.0.0.1:9009/ws/paddle_pong_game/";
        let ws = new WebSocket(wssUrl);
        ws.onopen = async (event) => {
            console.log('paddle game WebSocket conection established.');
            ws.send(JSON.stringify({'type_msg': 'add_group', 'group_name': game_data.game_id}));
            ws.send(JSON.stringify({'type_msg': 'assigning_paddle', 'paddle': choicePaddle(game_data)}));
            ws.send(JSON.stringify(userConnectionInfo()));
            // await sendPlayerPaddleCreated();
        }
        ws.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            if (message.type_msg === "draw_info")
                draw_info(message);
            else if (message.type_msg === "game_over") {
                console.log("---------------------------------------message: ", message);
                game_data.player1_score = message.left_paddle_score;
                game_data.player2_score = message.right_paddle_score;
                await showWinner();
            }
            else if (message.type_msg === "consumer_paddle_created")
                await sendPlayerPaddleCreated();
            else
                console.log("else message: ", message);
        }
        return (ws);
    } catch (error) {
        console.error('error: ', error)
    }
}

async function connectBallSocket() {
    try {
        const wssUrl = "ws://127.0.0.1:9009/ws/remote_pong_game/";
        // const wssUrl = "ws://" + window.env.DJANGO_HOSTNAME + ":8080/wss/start/g1/";
        let ws = new WebSocket(wssUrl);
        ws.onopen = async (event) => {
            console.log('remote game WebSocket conection established.');
            ws.send(JSON.stringify({'type_msg': 'add_group', 'group_name': game_data.game_id}));
        }
        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log("remote game message:", message);
            if (message.type_msg === "create_ball_socket")
                ws.send(JSON.stringify({'type_msg': 'move'}));
            else if (message.type_msg === "play")
                descounterRemoteGame();
        }
        return (ws);
    } catch (error) {
        console.error('error: ', error)
    }
}

initPlayRemoteGame(connectBallSocket);


async function descounterRemoteGame() {
    (!game_connected) && await connectGame();
    await sleep(3);
    await playRemotePongGame();
    console.log("-----descounterRemoteGame: ", game_connected);
    launchGame();
}