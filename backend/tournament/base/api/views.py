from base.models import Tournament, TournamentParticipant, Match
from base.serializers import TournamentSerializer, TournamentParticipantSerializer, MatchSrializer
from rest_framework.decorators import api_view
from .helpers import check_auth, get_user_info, get_user
from rest_framework.response import Response
import random
import requests
from web3 import Web3
from base.validators import CustomUsernameValidator
from django.core.exceptions import ValidationError
import sys

tournament_count : int = 0

def check_unfinished_tournament(w3, contract, creator_id):
    try:
        matches = contract.functions.getLatestTournament(creator_id).call()
    except Exception as e:
        return Response({'message': 'there is no unfinished tournament'}, status=200)

    formatted_matches = [
        {
            'tournamentId': match[0],
            'matchNumber': match[1],
            'playerOneId': match[2],
            'playerOneName': match[3],
            'playerTwoId': match[4],
            'playerTwoName': match[5],
            'playerOneScore': match[6],
            'playerTwoScore': match[7],
            'winnerId': match[8],
            'status': match[9],
            'stage': match[10],
        }
        for match in matches
    ]
    if len(formatted_matches) != 7 or formatted_matches[6]['status'] != 'complete':
        return Response({'message': 'tournament unfinished', 'tournament_matches': formatted_matches}, status=200)
    
    return Response({'message': 'there is no unfinished tournament'}, status=200)

@api_view(['POST'])
def check_tournament(request):
    w3 = request.w3
    contract = request.contract
    AUTH_HEADER = request.META.get('HTTP_AUTHORIZATION')
    session_id = request.headers.get('Session-ID')
    auth_check_response = check_auth(AUTH_HEADER, session_id)
    if auth_check_response.status_code != 200:
        return Response(data=auth_check_response.json(), status=auth_check_response.status_code)
    
    creator_id = auth_check_response.json()['user_data']['id']

    response = check_unfinished_tournament(w3, contract, creator_id)
    return response

    

@api_view(['POST'])
def create_tournament(request):
    global tournament_count
    w3 = request.w3
    contract = request.contract
    AUTH_HEADER = request.META.get('HTTP_AUTHORIZATION')
    session_id = request.headers.get('Session-ID')
    auth_check_response = check_auth(AUTH_HEADER, session_id)
    if auth_check_response.status_code != 200:
        return Response(data=auth_check_response.json(), status=auth_check_response.status_code)
    
    # check if user is not in a game
    response = requests.get('https://server:9006/api/gamedb/is-available/', headers={'AUTHORIZATION': AUTH_HEADER, 'Session-ID': session_id}, verify=False)
    if response.status_code != 200:
        return Response({'message': 'user not available to create tournament'}, status=400)

    creator_id = auth_check_response.json()['user_data']['id']

    check_response = check_unfinished_tournament(w3=w3, contract=contract, creator_id=creator_id)

    if check_response.data['message'] == 'tournament unfinished':
        return check_response

    participants = request.data.get('participants', [])

    if not participants or not isinstance(participants, list):
        return Response({'message': 'participants must be provided as a list'}, status=400)
    
    if not len(participants) == 8:
        return Response({'message': 'unvalid number of participants, valid number is 8'}, status=400)

    if len(participants) != len(set(participants)):
        return Response({'message': 'Cannot creat tournament with duplicate usernames'}, status=400)
    
    validator = CustomUsernameValidator()

    for participant in participants:
        try:
            validator(participant)
        except ValidationError as e:
            return Response({'message': f"Invalid username {participant}: {e.message}"}, status=400)
    owner_username = participants[0]

    update_data_response = requests.put('https://server:9004/api/auth/update-user/', headers={'AUTHORIZATION': AUTH_HEADER, 'Session-ID': session_id}, json={'tournament_username': owner_username}, verify=False)
    random.shuffle(participants)

    create_tournament_tx_hash = contract.functions.createTournament(int(tournament_count), int(creator_id), participants).transact()
    w3.eth.wait_for_transaction_receipt(create_tournament_tx_hash)
    
    try:
        matches = contract.functions.getTournamentMatches(int(tournament_count)).call()
    except Exception as e:
        return Response({'message': str(e)}, status=400)
    tournament_count += 1

    formatted_matches = [
        {
            'tournamentId': match[0],
            'matchNumber': match[1],
            'playerOneId': match[2],
            'playerOneName': match[3],
            'playerTwoId': match[4],
            'playerTwoName': match[5],
            'stage': match[10],
        }
        for match in matches
    ]

    return Response({'message': 'tournament created', 'tournament_matches': formatted_matches}, status=201)


@api_view(['POST'])
def start_match(request):
    w3 = request.w3
    contract = request.contract

    AUTH_HEADER = request.META.get('HTTP_AUTHORIZATION')
    session_id = request.headers.get('Session-ID')
    auth_check_response = check_auth(AUTH_HEADER, session_id)
    if auth_check_response.status_code != 200:
        return Response(data=auth_check_response.json(), status=auth_check_response.status_code)
    
    match_number = request.data.get('match_id')
    tournament_id = request.data.get('tournament_id')

    print('match_number ', match_number)
    print('tournament_id ', tournament_id)

    if not match_number or not tournament_id:
        return Response({'message': 'match_id and tournament_id required'}, status=400)
    

    match_number = int(match_number)
    tournament_id = int(tournament_id)
    if match_number < 0 or tournament_id < 0:
        return Response({'message': 'match_number and tournament can\'t be negative'}, status=400)


    try:
        matches = contract.functions.getTournamentMatches(tournament_id).call()
    except Exception as e:
        return Response({'message': str(e)}, status=400)
    for match in matches:
        if match[9] == 'ongoing':
            return Response({'message': 'can\'t start match while other match is ongoing'}, status=400)
        if match[1] == match_number and match[9] != 'upcoming':
            return Response({'message': 'can\'t start match'}, status=400)

    try:
        start_match_tx = contract.functions.startMatch(match_number, tournament_id).transact()
        w3.eth.wait_for_transaction_receipt(start_match_tx)
    except Exception as e:
        return Response({'message': str(e)}, status=400)

    try:
        matchess = contract.functions.getTournamentMatches(tournament_id).call()
    except Exception as e:
        return Response({'message': str(e)}, status=400)
 
    print(matchess)
    formatted_matches = [
        {
            'tournamentId': match[0],
            'matchNumber': match[1],
            'playerOneId': match[2],
            'playerOneName': match[3],
            'playerTwoId': match[4],
            'playerTwoName': match[5],
            'status': match[9],
            'stage': match[10],
        }
        for match in matchess
    ]

    return Response({'message': 'match ongoing', 'matches': formatted_matches}, status=200)

@api_view(['POST'])
def cancel_match(request):
    w3 = request.w3
    contract = request.contract

    AUTH_HEADER = request.META.get('HTTP_AUTHORIZATION')
    session_id = request.headers.get('Session-ID')
    auth_check_response = check_auth(AUTH_HEADER, session_id)
    if auth_check_response.status_code != 200:
        return Response(data=auth_check_response.json(), status=auth_check_response.status_code)
    
    match_number = request.data.get('match_id')
    tournament_id = request.data.get('tournament_id')

    if not match_number or not tournament_id:
        return Response({'message': 'match_id and tournament_id required'}, status=400)
    

    match_number = int(match_number)
    tournament_id = int(tournament_id)
    if match_number < 0 or tournament_id < 0:
        return Response({'message': 'match_number and tournament can\'t be negative'}, status=400)


    try:
        matches = contract.functions.getTournamentMatches(tournament_id).call()
    except Exception as e:
        return Response({'message': str(e)}, status=400)
    for match in matches:
        if match[1] == match_number and match[9] != 'ongoing':
            return Response({'message': 'can\'t cancel match'}, status=400)
    
    try:
        cancel_match_tx = contract.functions.cancelMatch(match_number, tournament_id).transact()
        w3.eth.wait_for_transaction_receipt(cancel_match_tx)
    except Exception as e:
        return Response({'message': str(e)}, status=400)
    
    try:
        matchess = contract.functions.getTournamentMatches(tournament_id).call()
    except Exception as e:
        return Response({'message': str(e)}, status=400)
 
    print(matchess)
    formatted_matches = [
        {
            'tournamentId': match[0],
            'matchNumber': match[1],
            'playerOneId': match[2],
            'playerOneName': match[3],
            'playerTwoId': match[4],
            'playerTwoName': match[5],
            'status': match[9],
            'stage': match[10],
        }
        for match in matchess
    ]

    return Response({'message': 'match canceled', 'matches': formatted_matches}, status=200)

@api_view(['POST'])
def add_match_score(request):
    w3 = request.w3
    contract = request.contract

    AUTH_HEADER = request.META.get('HTTP_AUTHORIZATION')
    session_id = request.headers.get('Session-ID')
    auth_check_response = check_auth(AUTH_HEADER, session_id)
    if auth_check_response.status_code != 200:
        return Response(data=auth_check_response.json(), status=auth_check_response.status_code)
    
    match_number = request.data.get('match_id')
    tournament_id = request.data.get('tournament_id')
    player_one_score = request.data.get('player_one_score')
    player_two_score = request.data.get('player_two_score')

    if not match_number or not tournament_id or not player_one_score or not player_two_score:
        return Response({'message': 'match_id, tournament_id required, player_one_score and player_two_score'}, status=400)
    
    match_number = int(match_number)
    tournament_id = int(tournament_id)
    player_one_score = int(player_one_score)
    player_two_score = int(player_two_score)

    print(match_number, tournament_id, file=sys.stderr)

    try:
        matches = contract.functions.getTournamentMatches(tournament_id).call()
    except Exception as e:
        return Response({'message': str(e)}, status=400)
    
    for match in matches:
        if match[1] == match_number:
            if match[9] != 'ongoing':
                return Response({'message': 'can\'t set match score'}, status=400)

    try:
        start_match_tx = contract.functions.addMatchScore(match_number, tournament_id, player_one_score, player_two_score).transact()
        w3.eth.wait_for_transaction_receipt(start_match_tx)
    except Exception as e:
        return Response({'message': str(e)}, status=400)
    
    try:
        matchess = contract.functions.getTournamentMatches(tournament_id).call()
    except Exception as e:
        return Response({'message': str(e)}, status=400)
 
    print(matchess)
    formatted_matches = [
        {
            'tournamentId': match[0],
            'matchNumber': match[1],
            'playerOneId': match[2],
            'playerOneName': match[3],
            'playerTwoId': match[4],
            'playerTwoName': match[5],
            'playerOneScore': match[6],
            'playerTwoScore': match[7],
            'status': match[9],
            'stage': match[10],
        }
        for match in matchess
    ]

    return Response({'message': 'match score added', 'matches': formatted_matches}, status=200)


@api_view(['POST'])
def get_next_stage(request):
    w3 = request.w3
    contract = request.contract

    AUTH_HEADER = request.META.get('HTTP_AUTHORIZATION')
    session_id = request.headers.get('Session-ID')
    auth_check_response = check_auth(AUTH_HEADER, session_id)
    if auth_check_response.status_code != 200:
        return Response(data=auth_check_response.json(), status=auth_check_response.status_code)
    
    tournament_id = request.data.get('tournament_id')

    if not tournament_id:
        return Response({'message': 'tournament_id required'}, status=400)
    
    tournament_id = int(tournament_id)

    try:
        set_stage_tx = contract.functions.setNextStage(tournament_id).transact()
        w3.eth.wait_for_transaction_receipt(set_stage_tx)
    except Exception as e:
        return Response({'message': str(e)}, status=400)
    
    try:
        matchess = contract.functions.getNextStage(tournament_id).call()
    except Exception as e:
        return Response({'message': str(e)}, status=401)
    
    formatted_matches = [
        {
            'tournamentId': match[0],
            'matchNumber': match[1],
            'playerOneId': match[2],
            'playerOneName': match[3],
            'playerTwoId': match[4],
            'playerTwoName': match[5],
            'playerOneScore': match[6],
            'playerTwoScore': match[7],
            'winnerId': match[8],
            'status': match[9],
            'stage': match[10],
        }
        for match in matchess
    ]
    return Response({'message': formatted_matches}, status=200)

@api_view(['GET'])
def get_tournament_history(request):
    w3 = request.w3
    contract = request.contract

    AUTH_HEADER = request.META.get('HTTP_AUTHORIZATION')
    session_id = request.headers.get('Session-ID')
    auth_check_response = check_auth(AUTH_HEADER, session_id)
    if auth_check_response.status_code != 200:
        return Response(data=auth_check_response.json(), status=auth_check_response.status_code)
    
    creator_id = auth_check_response.json()['user_data']['id']

    try:
        matches = contract.functions.getTournamentHistory(creator_id).call()
    except Exception as e:
        return Response({'message': str(e)}, status=400)
    
    print('---- matches ----', matches, file=sys.stderr)

    formatted_matches = [
        {
            'tournamentId': match[0],
            'firstPlayerName': match[3] if match[8] == match[2] else match[5],
            'secondPlayerName': match[3] if match[8] != match[2] else match[5],
        }
        for match in matches
    ]
    return Response({'message': formatted_matches}, status=200)

@api_view(['POST'])
def get_tournament_history_bu_username(request):
    w3 = request.w3
    contract = request.contract

    AUTH_HEADER = request.META.get('HTTP_AUTHORIZATION')
    session_id = request.headers.get('Session-ID')
    auth_check_response = check_auth(AUTH_HEADER, session_id)
    if auth_check_response.status_code != 200:
        return Response(data=auth_check_response.json(), status=auth_check_response.status_code)
    
    username = request.data.get('username')
    if not username:
        return Response({'message': 'username is required'}, status=400)
    
    user_response = get_user(username=username, auth_header=AUTH_HEADER, session_id=session_id)
    if user_response.status_code != 200:
        return Response(user_response.json(), user_response.status_code)
    user_data = user_response.json()['user_data']
    creator_id = user_data['id']

    try:
        matches = contract.functions.getTournamentHistory(creator_id).call()
    except Exception as e:
        return Response({'message': str(e)}, status=400)
    
    print('---- matches ----', matches, file=sys.stderr)

    formatted_matches = [
        {
            'tournamentId': match[0],
            'firstPlayerName': match[3] if match[8] == match[2] else match[5],
            'secondPlayerName': match[3] if match[8] != match[2] else match[5],
        }
        for match in matches
    ]
    return Response({'message': formatted_matches}, status=200)

@api_view(['POST'])
def get_tournament_by_id(request):
    w3 = request.w3
    contract = request.contract

    AUTH_HEADER = request.META.get('HTTP_AUTHORIZATION')
    print('------ auth token ------', AUTH_HEADER, file=sys.stderr)
    session_id = request.headers.get('Session-ID')
    auth_check_response = check_auth(AUTH_HEADER, session_id)
    if auth_check_response.status_code != 200:
        return Response(data=auth_check_response.json(), status=auth_check_response.status_code)
    
    tournament_id = request.data.get('tournament_id')

    if not tournament_id:
        return Response({'message': 'tournament_id is required'}, status=400)
    
    try:
        matches = contract.functions.getTournamentMatches(int(tournament_id)).call()
    except Exception as e:
        return Response({'message': str(e)}, status=400)
    
    formatted_matches = [
        {
            'tournamentId': match[0],
            'matchNumber': match[1],
            'playerOneId': match[2],
            'playerOneName': match[3],
            'playerTwoId': match[4],
            'playerTwoName': match[5],
            'playerOneScore': match[6],
            'playerTwoScore': match[7],
            'winnerId': match[8],
            'status': match[9],
            'stage': match[10],
        }
        for match in matches
    ]
    return Response({'message': 'tournament found', 'matches': formatted_matches}, status=200)

