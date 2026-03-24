// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";

contract AnonymousVoting {
    ISemaphore public semaphore;
    uint256 public groupId;
    address public admin;

    uint256 public votesFor;
    uint256 public votesAgainst;
    bool public votingOpen;
    string public proposal;

    event VoteCast(uint256 indexed vote);
    event VotingStarted(string proposal);
    event VotingEnded(uint256 votesFor, uint256 votesAgainst);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor(address _semaphore) {
        semaphore = ISemaphore(_semaphore);
        admin = msg.sender;

        // ✅ v4: createGroup() без аргументів — повертає groupId
        // адмін групи = цей контракт (address(this))
        groupId = semaphore.createGroup(address(this));
    }

    function addVoter(uint256 identityCommitment) external onlyAdmin {
        semaphore.addMember(groupId, identityCommitment);
    }

    function addVoters(uint256[] calldata identityCommitments) external onlyAdmin {
        // ✅ v4: є вбудований addMembers
        semaphore.addMembers(groupId, identityCommitments);
    }

    function startVoting(string calldata _proposal) external onlyAdmin {
        require(!votingOpen, "Voting already open");
        proposal = _proposal;
        votesFor = 0;
        votesAgainst = 0;
        votingOpen = true;
        emit VotingStarted(_proposal);
    }

    function castVote(
        uint256 vote,
        uint256 merkleTreeDepth,
        uint256 merkleTreeRoot,
        uint256 nullifier,
        uint256[8] calldata points  // ✅ тільки points, без окремого proof!
    ) external {
        require(votingOpen, "Voting is not open");
        require(vote == 1 || vote == 2, "Invalid vote");

        // ✅ ПРАВИЛЬНА структура для v4 — 6 полів!
        ISemaphore.SemaphoreProof memory semProof = ISemaphore.SemaphoreProof({
            merkleTreeDepth: merkleTreeDepth,
            merkleTreeRoot:  merkleTreeRoot,
            nullifier:       nullifier,
            message:         vote,
            scope:           groupId,
            points:          points    // ← points і є ZK-доказ, окремого "proof" немає
        });

        // Semaphore перевіряє:
        // ✅ Людина є членом групи
        // ✅ Nullifier ще не використовувався (захист від повторного голосування)
        // ✅ ZK-доказ математично валідний
        semaphore.validateProof(groupId, semProof);

        if (vote == 1) {
            votesFor++;
        } else {
            votesAgainst++;
        }

        emit VoteCast(vote);
    }

    function endVoting() external onlyAdmin {
        require(votingOpen, "Voting not open");
        votingOpen = false;
        emit VotingEnded(votesFor, votesAgainst);
    }

    function getResults() external view returns (
        string memory _proposal,
        uint256 _for,
        uint256 _against,
        bool _isOpen
    ) {
        return (proposal, votesFor, votesAgainst, votingOpen);
    }
}