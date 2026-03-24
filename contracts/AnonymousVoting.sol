// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";

contract AnonymousVoting {
    ISemaphore public semaphore;
    uint256 public groupId;
    address public admin;

    // 🔥 Лічильник голосувань — ключ до багаторазового голосування
    uint256 public proposalId;
    string public proposal;
    bool public isOpen;
    uint256 public votesFor;
    uint256 public votesAgainst;

    event VotingStarted(uint256 indexed proposalId, string proposal);
    event VotingEnded(uint256 indexed proposalId, uint256 votesFor, uint256 votesAgainst);
    event VoteCast(uint256 indexed proposalId, uint256 vote);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor(address _semaphoreAddress) {
        semaphore = ISemaphore(_semaphoreAddress);
        admin = msg.sender;
        proposalId = 0;

        // ✅ v4: createGroup(address admin) → повертає groupId автоматично
        groupId = semaphore.createGroup(address(this));
    }

    // ─────────────────────────────────────────
    //  Управління учасниками
    // ─────────────────────────────────────────

    function addVoter(uint256 identityCommitment) external onlyAdmin {
        semaphore.addMember(groupId, identityCommitment);
    }

    function addVoters(uint256[] calldata identityCommitments) external onlyAdmin {
        semaphore.addMembers(groupId, identityCommitments);
    }

    // ─────────────────────────────────────────
    //  Управління голосуванням
    // ─────────────────────────────────────────

    function startVoting(string calldata _proposal) external onlyAdmin {
        require(!isOpen, "Voting already open");

        proposal = _proposal;
        votesFor = 0;
        votesAgainst = 0;
        isOpen = true;

        // 🔥 КЛЮЧОВА МАГІЯ:
        // proposalId збільшується → scope змінюється → 
        // nullifier'и для нового голосування будуть ІНШИМИ!
        proposalId++;

        emit VotingStarted(proposalId, _proposal);
    }

    function endVoting() external onlyAdmin {
        require(isOpen, "Voting not open");
        isOpen = false;
        emit VotingEnded(proposalId, votesFor, votesAgainst);
    }

    // ─────────────────────────────────────────
    //  Голосування з ZK-доказом
    // ─────────────────────────────────────────

    function castVote(
        uint256 vote,
        uint256 merkleTreeDepth,
        uint256 merkleTreeRoot,
        uint256 nullifier,
        uint256[8] calldata points
    ) external {
        require(isOpen, "Voting is not open");
        require(vote == 1 || vote == 2, "Invalid vote: 1=For, 2=Against");

        // ✅ Правильна структура для Semaphore v4
        ISemaphore.SemaphoreProof memory semProof = ISemaphore.SemaphoreProof({
            merkleTreeDepth: merkleTreeDepth,
            merkleTreeRoot:  merkleTreeRoot,
            nullifier:       nullifier,
            message:         vote,
            scope:           proposalId, // 🔥 scope = proposalId, не groupId!
            points:          points
        });

        // validateProof:
        // ✅ Перевіряє ZK-доказ математично
        // ✅ Перевіряє що nullifier не використовувався (для цього proposalId)
        // ✅ Зберігає nullifier щоб не дати проголосувати двічі
        semaphore.validateProof(groupId, semProof);

        if (vote == 1) {
            votesFor++;
        } else {
            votesAgainst++;
        }

        emit VoteCast(proposalId, vote);
    }

    // ─────────────────────────────────────────
    //  Читання даних (для фронтенду)
    // ─────────────────────────────────────────

    function getVotingData() external view returns (
        string memory _proposal,
        bool _isOpen,
        uint256 _votesFor,
        uint256 _votesAgainst,
        address _admin,
        uint256 _groupId,
        uint256 _proposalId
    ) {
        return (
            proposal,
            isOpen,
            votesFor,
            votesAgainst,
            admin,
            groupId,
            proposalId
        );
    }
}