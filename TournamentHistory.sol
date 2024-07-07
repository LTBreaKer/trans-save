// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0 <0.9.0;

contract TournamentHistory {

    struct Match {
        uint user1_id;
        uint user2_id;
        uint winner_id;
    }

    struct Tournament {
        uint128[4] user_ids;
        Match[4] matchs;
    }

    mapping(uint128 => Tournament) Tournaments;

    function addTournament(uint128 _Tournament_id, uint128[4] memory _user_ids) public {
        for(uint i = 0; i < 4; i++) {
            Tournaments[_Tournament_id].user_ids[i] = _user_ids[i];
        }
    }

    function retrieveTournament(uint128 _Tournament_id) public view returns(uint128[4] memory, Match[4] memory) {
        return (Tournaments[_Tournament_id].user_ids, Tournaments[_Tournament_id].matchs);
    }

    // function addmatch(uint128 _Tournament_id, uint128 _user1_id, uint128 _user2_id) public {
    //     Tournaments[_Tournament_id];
    // }



}