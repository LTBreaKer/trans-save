// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0 <0.9.0;

contract TournamentContract {

    struct TournamentParticipant {
        uint256 id;
        string username;
        uint256 tournamentId;
    }
    
    struct Match {
        uint256 tournamentId;
        uint256 matchNumber;
        uint256 playerOneId;
        uint256 playerTwoId;
        uint256 playerOneScore;
        uint256 playerTwoScore;
        uint256 winnerId;
        string status;
        string stage;
    }

    struct Tournament {
        uint256 id;
        uint256 creatorId;
        uint256 createdAt;
    }


    TournamentParticipant[] public participants;
    Match[] public matches;
    Tournament[] public tournaments;

    function    createTournament(uint256 _tournamentId, uint256 _creator, string[] memory _usernames) public {
        Match[4] memory returnMatches;
        uint256 tournamentId = _tournamentId;
        tournaments.push(Tournament(tournamentId, _creator, block.timestamp));

        uint256 oldNumberOfParticipants = participants.length;
        for(uint i = 0; i < 8; i++) {
            participants.push(TournamentParticipant(oldNumberOfParticipants++, _usernames[i], tournamentId));
        }
        oldNumberOfParticipants -= 8;
        for(uint i = 0; i < 8; i+=2) {
            returnMatches[i / 2] = Match(
                tournamentId,
                i / 2 + 1,
                participants[oldNumberOfParticipants++].id,
                participants[oldNumberOfParticipants++].id,
                0,
                0,
                0,
                "upcoming",
                "1/4"
                );
            matches.push(returnMatches[i / 2]);
        }
    }

    function    getTournamentMatches(uint256 _tournamentId) public view returns (Match[] memory _matches) {

        require(tournaments.length > 0, "No tournaments exist");
        require(_tournamentId < tournaments.length, "no tournament found with the provided id");

        uint count = 0;
        for (uint256 i = 0; i < matches.length; i++) {
            if (matches[i].tournamentId == _tournamentId) {
                count++;
            }
        }

        Match[] memory returnMatches =  new Match[](count);

        uint index = 0;
        for (uint256 i = 0; i < matches.length; i++) {
            if (matches[i].tournamentId == _tournamentId) {
                returnMatches[index++] = Match({
                    tournamentId: matches[i].tournamentId,
                    matchNumber: matches[i].matchNumber,
                    playerOneId: matches[i].playerOneId,
                    playerTwoId: matches[i].playerTwoId,
                    playerOneScore: matches[i].playerOneScore,
                    playerTwoScore: matches[i].playerTwoScore,
                    winnerId: matches[i].winnerId,
                    status: matches[i].status,
                    stage: matches[i].stage
                });
            }
        }
        return (returnMatches);
    }
    
    function startMatch(uint256 _matchNumber, uint256 _tournamentId) public {
        bool matchFound = false;

        for (uint256 i = 0; i < matches.length; i++) {
            if (matches[i].tournamentId == _tournamentId && matches[i].matchNumber == _matchNumber) {
                matches[i].status = "ongoing";
                matchFound = true;
                break;
            }
        }
        require(matchFound == true, "no match found with the provided match_number and tournament_id");
    }

    function addMatchScore(uint256 _matchNumber, uint256 _tournamentId, uint256 _playerOneScore, uint256 _playerTwoScore) public {
        bool matchFound = false;

        for (uint256 i = 0; i < matches.length; i++) {
            if (matches[i].tournamentId == _tournamentId && matches[i].matchNumber == _matchNumber) {
                matchFound = true;
                matches[i].playerOneScore = _playerOneScore;
                matches[i].playerTwoScore = _playerTwoScore;
                if (matches[i].playerOneScore > matches[i].playerTwoScore)
                    matches[i].winnerId = matches[i].playerOneId;
                else
                    matches[i].winnerId = matches[i].playerTwoId;
                matches[i].status = "complete";
                break;
            }
        }
        require(matchFound == true, "no match found with the provided match_number and tournament_id");
    }

    function getNextStage(uint256 _tournamentId) public view {
        uint256 completedMatchesNumber = 0;

        for (uint256 i = 0; i < matches.length; i++) {
            if (matches[i].tournamentId == _tournamentId) {
                completedMatchesNumber++;
            }
        }
        Match[] memory completedMatches = new Match[](completedMatchesNumber);
        uint index = 0;
        for (uint256 i = 0; i < matches.length; i++) {
            if (matches[i].tournamentId == _tournamentId && (matches[i].playerOneScore != 0 || matches[i].playerTwoScore != 0) ) {
                completedMatches[index++] = Match({
                    tournamentId: matches[i].tournamentId,
                    matchNumber: matches[i].matchNumber,
                    playerOneId: matches[i].playerOneId,
                    playerTwoId: matches[i].playerTwoId,
                    playerOneScore: matches[i].playerOneScore,
                    playerTwoScore: matches[i].playerTwoScore,
                    winnerId: matches[i].winnerId,
                    status: matches[i].status,
                    stage: matches[i].stage
                });
            }
        }
        
        

    }

    // function createStage(uint256 _tournamentId, uint256 _stageMatchCount) public {
    //     bool tournamentFound = false;
    //     uint256[] memory winnersIds = new uint256[](_stageMatchCount * 2);
        

    //     for (uint256 i = 0; i < tournaments.length; i++) {
    //         if (tournaments[i].id == _tournamentId) {
    //             tournamentFound = true;
    //             for (uint256 j = matches.length - _stageMatchCount * 2; j < matches.length; j += 2) {
                    
    //             }
    //         }
    //     }
    // }
    
    // struct Match {
    //     string username_one;
    //     string username_two;
    //     uint user_one_score;
    //     uint user_two_score;
    //     uint256 match_number;
    // }

    // struct Tournament {
    //     string[8]  participants;
    //     Match[7]    matches;
    //     uint        matchCount;
    // }

    // mapping(uint256 => Tournament) private tournaments;
    // mapping(uint256 => bool) private exists;


    // function addTournament(uint256 _tournamentId, uint256[4] memory _userIds) public {
    //     for(uint i = 0; i < 4; i++) {
    //         require(exists[_userIds[i]] == false, "Cannot create tournament with duplicate users");
    //         tournaments[_tournamentId].userIds[i] = _userIds[i];
    //         exists[_userIds[i]] = true;
    //     }
    // }

    // function getTournament(uint256 _tournamentId) public view returns(Tournament memory) {
    //     Tournament memory t = tournaments[_tournamentId];
    //     require(t.userIds[0] != 0, "tournament doesn't exist.");
    //     return t;
    // }

    // function addMatch(uint256 _tournamentId, uint256 _user1Id, uint256 _user2Id, uint256 _matchId, uint[2] memory _score) public {
    //     require(tournaments[_tournamentId].userIds[0] != 0, "tournament doesn't exist.");
    //     uint matchCount = tournaments[_tournamentId].matchCount;
    //     require(matchCount < 3, "All matches have been already added.");
    //     require(_user1Id != _user2Id, "Cannot create a match with duplicate users");
    //     bool user1exists = false;
    //     bool user2exists = false;

    //     for(uint i = 0; i < 4; i++) {
    //         if(tournaments[_tournamentId].matches[i].user1Id == _user1Id) {
    //             user1exists = true;
    //         }
    //         if(tournaments[_tournamentId].matches[i].user2Id == _user2Id) {
    //             user2exists = true;
    //         }
    //     }
    //     require(user1exists && user2exists, "User not signed in the tournament");
    //     tournaments[_tournamentId].matches[matchCount].user1Id = _user1Id;
    //     tournaments[_tournamentId].matches[matchCount].user2Id = _user2Id;
    //     tournaments[_tournamentId].matches[matchCount].score = _score;
    //     tournaments[_tournamentId].matches[matchCount].matchId = _matchId;
    //     tournaments[_tournamentId].matchCount++;
    // }
}