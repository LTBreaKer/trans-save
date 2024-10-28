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
        string playerOneName;
        uint256 playerTwoId;
        string playerTwoName;
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
                participants[oldNumberOfParticipants].id,
                participants[oldNumberOfParticipants++].username,
                participants[oldNumberOfParticipants].id,
                participants[oldNumberOfParticipants++].username,
                0,
                0,
                0,
                "upcoming",
                "1/4"
                );
            matches.push(returnMatches[i / 2]);
        }
    }

    function getTournamentHistory(uint256 _creatorId) public view returns (Match[] memory _matches) {

        uint256 matchCount = 0;
        for (uint256 i = 0; i < tournaments.length; i++) {
            if (tournaments[i].creatorId == _creatorId) {
                for (uint256 j = 0; j < matches.length; j++) {
                    if (matches[j].tournamentId == tournaments[i].id) {
                        if (keccak256(abi.encodePacked(matches[j].stage)) == keccak256(abi.encodePacked('1/1'))){
                            if (keccak256(abi.encodePacked(matches[j].status)) == keccak256(abi.encodePacked('complete'))){
                                matchCount++;
                            }
                        }
                    }
                }
            }
        }
        Match[] memory returnMatches = new Match[](matchCount);
        uint256 returnindex = 0;

        for (uint256 i = 0; i < tournaments.length; i++) {
            if (tournaments[i].creatorId == _creatorId) {
                for (uint256 j = 0; j < matches.length; j++) {
                    if (matches[j].tournamentId == tournaments[i].id) {
                        if (keccak256(abi.encodePacked(matches[j].stage)) == keccak256(abi.encodePacked('1/1'))){
                            if (keccak256(abi.encodePacked(matches[j].status)) == keccak256(abi.encodePacked('complete'))){
                                returnMatches[returnindex++] = matches[j];
                            }
                        }
                    }
                }
            }
        }

        return returnMatches;
    }




    function getLatestTournament(uint256 _creatorId) public view returns (Match[] memory _matches){
        uint256 tournamentId;

        require(tournaments.length > 0, "there are zero tournaments");

        for (uint256 i = tournaments.length - 1; i >= 0; i--) {
            if (tournaments[i].creatorId == _creatorId) {
                tournamentId = tournaments[i].id;
                break;
            }
        }

        uint count = 0;
        for (uint256 i = 0; i < matches.length; i++) {
            if (matches[i].tournamentId == tournamentId) {
                count++;
            }
        }

        Match[] memory returnMatches =  new Match[](count);

        uint index = 0;
        for (uint256 i = 0; i < matches.length; i++) {
            if (matches[i].tournamentId == tournamentId) {
                returnMatches[index++] = Match({
                    tournamentId: matches[i].tournamentId,
                    matchNumber: matches[i].matchNumber,
                    playerOneId: matches[i].playerOneId,
                    playerOneName: matches[i].playerOneName,
                    playerTwoId: matches[i].playerTwoId,
                    playerTwoName: matches[i].playerTwoName,
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
                    playerOneName: matches[i].playerOneName,
                    playerTwoId: matches[i].playerTwoId,
                    playerTwoName: matches[i].playerTwoName,
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

    function cancelMatch(uint256 _matchNumber, uint256 _tournamentId) public {
        bool matchFound = false;

        for (uint256 i = 0; i < matches.length; i++) {
            if (matches[i].tournamentId == _tournamentId && matches[i].matchNumber == _matchNumber) {
                matches[i].status = "upcoming";
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

    function setNextStage(uint256 _tournamentId) public  {
        uint256 completedMatchesNumber = 0;
        bool correct = false;
        bool check = true;

        for (uint256 i = 0; i < matches.length; i++) {
            if (matches[i].tournamentId == _tournamentId && keccak256(abi.encodePacked(matches[i].status)) == keccak256(abi.encodePacked('complete'))) {
                completedMatchesNumber++;
            }
        }
        if (completedMatchesNumber != 4 && completedMatchesNumber != 6) {
            check = false;
        }
        require(check == true, 'cannot set next stage');
        Match[] memory completedMatches = new Match[](completedMatchesNumber);
        uint index = 0;
        for (uint256 i = 0; i < matches.length; i++) {
            if (matches[i].tournamentId == _tournamentId && (matches[i].playerOneScore != 0 || matches[i].playerTwoScore != 0) ) {
                completedMatches[index++] = Match({
                    tournamentId: matches[i].tournamentId,
                    matchNumber: matches[i].matchNumber,
                    playerOneId: matches[i].playerOneId,
                    playerOneName: matches[i].playerOneName,
                    playerTwoId: matches[i].playerTwoId,
                    playerTwoName: matches[i].playerTwoName,
                    playerOneScore: matches[i].playerOneScore,
                    playerTwoScore: matches[i].playerTwoScore,
                    winnerId: matches[i].winnerId,
                    status: matches[i].status,
                    stage: matches[i].stage
                });
            }
        }
        uint256 matchNumber = completedMatchesNumber + 1;
        if (completedMatchesNumber == 4) {
            correct = true;
            Match[] memory nextStage = new Match[](completedMatchesNumber / 2);
            for (uint256 i = 0; i < completedMatchesNumber; i += 2) {
                string memory playerOneName = "";
                string memory playerTwoName = "";

                if (completedMatches[i].winnerId == completedMatches[i].playerOneId)
                    playerOneName = completedMatches[i].playerOneName;
                else
                    playerOneName = completedMatches[i].playerTwoName;

                if (completedMatches[i + 1].winnerId == completedMatches[i + 1].playerOneId)
                    playerTwoName = completedMatches[i + 1].playerOneName;
                else
                    playerTwoName = completedMatches[i + 1].playerTwoName;
                nextStage[i / 2] = Match({
                    tournamentId: completedMatches[i].tournamentId,
                    matchNumber: matchNumber++,
                    playerOneId: completedMatches[i].winnerId,
                    playerOneName: playerOneName,
                    playerTwoId: completedMatches[i + 1].winnerId,
                    playerTwoName: playerTwoName,
                    playerOneScore: 0,
                    playerTwoScore: 0,
                    winnerId: 0,
                    status: 'upcoming',
                    stage: '1/2'
                });
                matches.push(nextStage[i / 2]);
            }
        }
        else if (completedMatchesNumber == 6) {
            correct = true;
            Match[] memory nextStage = new Match[](1);
            Match[] memory tmp = new Match[](2);
            uint256 index1 = 0;
            for (uint256 i = 0; i < completedMatchesNumber; i++) {
                if (keccak256(abi.encodePacked(completedMatches[i].stage)) == keccak256(abi.encodePacked('1/2'))) {
                    tmp[index1++] = Match({
                        tournamentId: completedMatches[i].tournamentId,
                        matchNumber: completedMatches[i].matchNumber,
                        playerOneId: completedMatches[i].playerOneId,
                        playerOneName: completedMatches[i].playerOneName,
                        playerTwoId: completedMatches[i].playerTwoId,
                        playerTwoName: completedMatches[i].playerTwoName,
                        playerOneScore: completedMatches[i].playerOneScore,
                        playerTwoScore: completedMatches[i].playerTwoScore,
                        winnerId: completedMatches[i].winnerId,
                        status: completedMatches[i].status,
                        stage: completedMatches[i].stage
                    });
                }
            }
            string memory playerOneName = "";
            string memory playerTwoName = "";

            if (tmp[0].winnerId == tmp[0].playerOneId)
                playerOneName = tmp[0].playerOneName;
            else
                playerOneName = tmp[0].playerTwoName;

            if (tmp[1].winnerId == tmp[1].playerOneId)
                playerTwoName = tmp[1].playerOneName;
            else
                playerTwoName = tmp[1].playerTwoName;
            nextStage[0] = Match({
                tournamentId: tmp[0].tournamentId,
                matchNumber: matchNumber++,
                playerOneId: tmp[0].winnerId,
                playerOneName: playerOneName,
                playerTwoId: tmp[1].winnerId,
                playerTwoName: playerTwoName,
                playerOneScore: 0,
                playerTwoScore: 0,
                winnerId: 0,
                status: 'upcoming',
                stage: '1/1'
            });
            matches.push(nextStage[0]);
        }
        require(correct == true, "cannot set the next stage");
    }

    function getNextStage(uint256 _tournamentId) public view returns(Match[] memory _nextStage) {
        uint256 completedMatchesNumber = 0;
        uint256 matchesNumber = 0;
        bool correct = false;

        for (uint256 i = 0; i < matches.length; i++) {
            if (matches[i].tournamentId == _tournamentId) {
                matchesNumber++;
            }
        }
        for (uint256 i = 0; i < matches.length; i++) {
            if (matches[i].tournamentId == _tournamentId && (matches[i].playerOneScore != 0 || matches[i].playerTwoScore != 0) ) {
                completedMatchesNumber++;
            }
        }
        Match[] memory tournamentMatches = new Match[](matchesNumber);
        uint index = 0;
        for (uint256 i = 0; i < matches.length; i++) {
            if (matches[i].tournamentId == _tournamentId) {
                tournamentMatches[index++] = Match({ 
                    tournamentId: matches[i].tournamentId,
                    matchNumber: matches[i].matchNumber,
                    playerOneId: matches[i].playerOneId,
                    playerOneName: matches[i].playerOneName,
                    playerTwoId: matches[i].playerTwoId,
                    playerTwoName: matches[i].playerTwoName,
                    playerOneScore: matches[i].playerOneScore,
                    playerTwoScore: matches[i].playerTwoScore,
                    winnerId: matches[i].winnerId,
                    status: matches[i].status,
                    stage: matches[i].stage
                });
            }
        }
        index = 0;
        if (completedMatchesNumber == 4) {
            correct = true;
            Match[] memory nextStage = new Match[](completedMatchesNumber / 2);
            for (uint256 i = 0; i < matchesNumber; i++) {
                if (keccak256(abi.encodePacked(tournamentMatches[i].stage)) == keccak256(abi.encodePacked("1/2"))) {
                    nextStage[index++] = Match({
                        tournamentId: tournamentMatches[i].tournamentId,
                        matchNumber: tournamentMatches[i].matchNumber,
                        playerOneId: tournamentMatches[i].playerOneId,
                        playerOneName: tournamentMatches[i].playerOneName,
                        playerTwoId: tournamentMatches[i].playerTwoId,
                        playerTwoName: tournamentMatches[i].playerTwoName,
                        playerOneScore: tournamentMatches[i].playerOneScore,
                        playerTwoScore: tournamentMatches[i].playerTwoScore,
                        winnerId: tournamentMatches[i].winnerId,
                        status: tournamentMatches[i].status,
                        stage: tournamentMatches[i].stage
                    });
                }
            }
            return nextStage;
        }
        else if (completedMatchesNumber == 6) {
            correct = true;
            Match[] memory nextStage = new Match[](1);
            for (uint256 i = 0; i < matchesNumber; i++) {
                if (keccak256(abi.encodePacked(tournamentMatches[i].stage)) == keccak256(abi.encodePacked("1/1"))) {
                    nextStage[index++] = Match({
                        tournamentId: tournamentMatches[i].tournamentId,
                        matchNumber: tournamentMatches[i].matchNumber,
                        playerOneId: tournamentMatches[i].playerOneId,
                        playerOneName: tournamentMatches[i].playerOneName,
                        playerTwoId: tournamentMatches[i].playerTwoId,
                        playerTwoName: tournamentMatches[i].playerTwoName,
                        playerOneScore: tournamentMatches[i].playerOneScore,
                        playerTwoScore: tournamentMatches[i].playerTwoScore,
                        winnerId: tournamentMatches[i].winnerId,
                        status: tournamentMatches[i].status,
                        stage: tournamentMatches[i].stage
                    });
                }
            }
            return nextStage;
        }
        require(correct == true, "cannot get the next stage");
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