# Secret Voting App — ZKP Anonymous Voting

A decentralized application (dApp) for secure and anonymous electronic voting using Zero-Knowledge Proofs (zk-SNARKs) and the Semaphore Protocol


Key Features

100% Anonymity, identity commitments are stored in an On-chain Merkle Tree. ZK-Proofs are generated locally in the browser via WebAssembly, meaning private keys (`Trapdoor` and `Nullifier`) never leave the user's device.

Gasless Voting, voters do not need to pay network fees. ZK-Proofs are sent to an off-chain Node.js Relayer, which submits the transaction to the blockchain and covers the Gas fees.

Anti-Double Voting, Prevents multiple votes from the same user mathematically using `Nullifier Hashes`.


Architecture

The system consists of three independent layers:
1. Smart Contract: Written in Solidity, deployed on the Sepolia Testnet. Verifies ZK-Proofs and maintains the Merkle Tree root.

2. Relayer (Off-chain Backend):** A Node.js/Express server that listens for HTTP requests from voters, wraps the ZK-Proof into a transaction, signs it, and pays the Gas.

3. Client Application: A React-based interface where users generate their local ZK-identities, connect via MetaMask (Ethers.js), and cast their votes.

Some screens from application + blockchain explorers

Main window
<img width="1205" height="311" alt="image" src="https://github.com/user-attachments/assets/edfc5520-9de1-46a2-8559-3cecd589ef17" />

Voting process (generated locally in the browser)
<img width="784" height="166" alt="image" src="https://github.com/user-attachments/assets/2d07b4df-a5cb-451b-b1be-ca3c2af49c1e" />

Explorer results (starting voting, adding new members, processing votes, and ending voting)
<img width="1369" height="241" alt="image" src="https://github.com/user-attachments/assets/0e4e2289-ebb9-4d94-8b94-72b3385a6fd5" />
