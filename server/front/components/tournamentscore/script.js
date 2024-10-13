import { loadHTML, loadCSS } from '../../utils.js';
import { tournament_match_data } from '../tournament/script.js';
import { log_out_func ,login , logoutf, get_localstorage, getCookie } from '../../auth.js';


let tournament = "https://127.0.0.1:9008/api/tournament/";

async function TournamentScore() {
  const html = await loadHTML('./components/tournamentscore/index.html');
  loadCSS('./components/tournamentscore/style.css');

  const app = document.getElementById('app');
  app.innerHTML = html;


const bottun = document.getElementById('bbbb');
bottun.addEventListener('click', async () =>  {
  await add_tournament_match_score(tournament_match_data)
  console.log("hello we are from bottun");
  if (tournament_match_data.matchNumber === 7)
    window.location.hash = "/ping";
  else
    window.location.hash = "/tournament";
})

console.log("text that i need to use it's here => : ", tournament_match_data)

}







async function add_tournament_match_score(params) {
  const participants = {
    match_id: params.matchNumber,
    tournament_id: params.tournamentId,
    player_one_score: 5, 
    player_two_score: 7,
  }
  
  const urlEncodedData = new URLSearchParams(participants);
  console.log("hello we are from morocco ")
  try {
    const response = await fetch(tournament + 'add-match-score/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + get_localstorage('token'),
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