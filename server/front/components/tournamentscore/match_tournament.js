import { loadHTML, loadCSS} from '../../utils.js';
import { tournament_match_data } from '../tournament/script.js';
import { log_out_func ,login , logoutf, get_localstorage, getCookie, check_access_token } from '../../auth.js';
import { isGameDataFull, loadHtmlWidthModuleScript, playGame } from '../pingpong/ping.js';
import { host } from '../../config.js';
// const host = "127.0.0.1";

let tournament = `https://${host}:9008/api/tournament/`;

async function TournamentScore() {
//   const html = await loadHTML('./components/tournamentscore/index.html');
//   loadCSS('./components/tournamentscore/style.css');

//   const app = document.getElementById('app');
//   app.innerHTML = html;

//   const bottun = document.getElementById('bbbb');
//   bottun.addEventListener('click', 
  //   async () =>  {
  //   await add_tournament_match_score(tournament_match_data)
  //   (tournament_match_data.matchNumber === 7) ?
  //    window.location.hash = "/ping" :
  //    window.location.hash = "/tournament";ƒ
  // })

// console.log("text that i need to use it's here => : ", tournament_match_data)
  if (await isGameDataFull()) {
    await loadHtmlWidthModuleScript();
    await playGame();
  }
}

export async function endTournamentMatchScore(player1_score, player2_score) {
	await add_tournament_match_score(tournament_match_data, player1_score, player2_score);
	// (tournament_match_data.matchNumber === 7) ?
	// window.location.hash = "/ping" :
	// window.location.hash = "/tournament";
}

async function add_tournament_match_score(params, player1_score, player2_score) {
  await check_access_token();
  const participants = {
    match_id: params.matchNumber,
    tournament_id: params.tournamentId,
    player_one_score: player1_score, 
    player_two_score: player2_score,
  }
  
  const urlEncodedData = new URLSearchParams(participants);
  console.log("hello we are from morocco ")
  try {
    const response = await fetch(tournament + 'add-match-score/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + get_localstorage('token'),
        'Session-ID': get_localstorage('session_id')
      },
      credentials: 'include',
      body: urlEncodedData
    });
    const jsonData = await response.json();
    console.log("here are match add score: =>  ", jsonData);    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }  
    
  } catch (error) {
    console.error('There was a problem with the fetch e here operation:', error);
  }  
  console.log(typeof params)
  console.log(params.matchNumber)
  if (params.matchNumber === 4 || params.matchNumber === 6) {
    await get_stage(params.tournamentId);
    console.log('----------------------------------------------------------')
    console.log('----------------------------------------------------------')
    console.log('----------------------------------------------------------')
  }  
}


async function get_stage(param) {
  await check_access_token();
  const participants = {
    tournament_id: param
  }
  const urlEncodedData = new URLSearchParams(participants);

    try {
      const response = await fetch(tournament + 'get-next-stage/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Bearer ' + get_localstorage('token'),
          'Session-ID': get_localstorage('session_id')
        },
        credentials: 'include',
        body: urlEncodedData
      });
      // console.log(response);
      const jsonData = await response.json();
      console.log("here stage or next stage=> ", jsonData);
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      // await login(jsonData.access, jsonData.refresh);
      
    } catch (error) {
      console.error('There was a problem with the fetch e here operation:', error);
    }



}


export default TournamentScore;