// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC8183Escrow {
    function completeJob(uint256 jobId) external;
    function refundJob(uint256 jobId, string calldata reason) external;
}

/**
 * @title TaskEvaluator
 * @notice The on-chain verification authority for FourCorners agent jobs.
 * @dev Implements the impartial Evaluator role in the ERC-8183 Agentic Commerce architecture.
 *      Verifies that an agent's execution delivered measurable on-chain results before releasing escrow.
 */
contract TaskEvaluator {
    address public owner;
    address public escrowContract;

    struct VerificationRecord {
        uint256 jobId;
        address agent;
        bytes32 proofHash;
        bool verified;
        uint256 verifiedAt;
        string verificationDetails; // JSON detailing checked conditions (e.g. "HF increased 1.15->1.35")
    }

    mapping(uint256 => VerificationRecord) public verificationRecords;
    mapping(address => uint256) public agentVerifiedJobsCount;

    event TaskVerified(uint256 indexed jobId, address indexed agent, bool success, string details);
    event TaskRejected(uint256 indexed jobId, address indexed agent, string reason);

    modifier onlyOwner() {
        require(msg.sender == owner, "ONLY_OWNER");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setEscrowContract(address _escrow) external onlyOwner {
        require(_escrow != address(0), "INVALID_ESCROW");
        escrowContract = _escrow;
    }

    /**
     * @notice Evaluates and verifies submitted agent deliverables.
     * @param jobId The ERC-8183 job identifier
     * @param agent The provider agent address
     * @param proofHash SHA-256 / keccak256 hash of the execution receipt & telemetry
     * @param passed Whether the cryptographic & on-chain state verification passed
     * @param details Human and machine readable verification report
     */
    function evaluateTask(
        uint256 jobId,
        address agent,
        bytes32 proofHash,
        bool passed,
        string calldata details
    ) external onlyOwner {
        require(escrowContract != address(0), "ESCROW_NOT_SET");

        verificationRecords[jobId] = VerificationRecord({
            jobId: jobId,
            agent: agent,
            proofHash: proofHash,
            verified: passed,
            verifiedAt: block.timestamp,
            verificationDetails: details
        });

        if (passed) {
            agentVerifiedJobsCount[agent]++;
            emit TaskVerified(jobId, agent, true, details);
            // Trigger automatic escrow release to the agent
            IERC8183Escrow(escrowContract).completeJob(jobId);
        } else {
            emit TaskRejected(jobId, agent, details);
            // Trigger refund back to client
            IERC8183Escrow(escrowContract).refundJob(jobId, details);
        }
    }

    function getVerification(uint256 jobId) external view returns (VerificationRecord memory) {
        return verificationRecords[jobId];
    }
}
