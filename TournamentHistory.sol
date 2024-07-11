// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0 <0.9.0;

contract TournamentHistory {

    struct Match {
        uint256 user1Id;
        uint256 user2Id;
        uint[2] score;
        uint256 matchId;
    }

    struct Tournament {
        uint256[4]  userIds;
        Match[3]    matches;
        uint        matchCount;
    }

    mapping(uint256 => Tournament) private tournaments;
    mapping(uint256 => bool) private exists;


    function addTournament(uint256 _tournamentId, uint256[4] memory _userIds) public {
        for(uint i = 0; i < 4; i++) {
            require(exists[_userIds[i]] == false, "Cannot create tournament with duplicate users");
            tournaments[_tournamentId].userIds[i] = _userIds[i];
            exists[_userIds[i]] = true;
        }
    }

    function getTournament(uint256 _tournamentId) public view returns(Tournament memory) {
        Tournament memory t = tournaments[_tournamentId];
        require(t.userIds[0] != 0, "tournament doesn't exist.");
        return t;
    }

    function addMatch(uint256 _tournamentId, uint256 _user1Id, uint256 _user2Id, uint256 _matchId, uint[2] memory _score) public {
        require(tournaments[_tournamentId].userIds[0] != 0, "tournament doesn't exist.");
        uint matchCount = tournaments[_tournamentId].matchCount;
        require(matchCount < 3, "All matches have been already added.");
        require(_user1Id != _user2Id, "Cannot create a match with duplicate users");
        bool user1exists = false;
        bool user2exists = false;

        for(uint i = 0; i < 4; i++) {
            if(tournaments[_tournamentId].matches[i].user1Id == _user1Id) {
                user1exists = true;
            }
            if(tournaments[_tournamentId].matches[i].user2Id == _user2Id) {
                user2exists = true;
            }
        }
        require(user1exists && user2exists, "User not signed in the tournament");
        tournaments[_tournamentId].matches[matchCount].user1Id = _user1Id;
        tournaments[_tournamentId].matches[matchCount].user2Id = _user2Id;
        tournaments[_tournamentId].matches[matchCount].score = _score;
        tournaments[_tournamentId].matches[matchCount].matchId = _matchId;
        tournaments[_tournamentId].matchCount++;
    }
}