// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ERC8183Escrow
 * @notice Real implementation of the ERC-8183 Agentic Commerce Standard on BNB Smart Chain.
 * @dev Manages the escrow lifecycle for hiring autonomous AI agents across Rebalancing,
 *      Grid Trading, Yield Optimisation, and Health Factor Monitoring.
 *      Jobs follow an immutable state machine: Open -> Funded -> Submitted -> Completed / Refunded.
 */
contract ERC8183Escrow {
    enum JobStatus {
        Open,       // 0: Job created, awaiting deposit
        Funded,     // 1: Budget locked in escrow
        Submitted,  // 2: Agent has executed task and submitted verifiable proof
        Completed,  // 3: Evaluator validated proof and funds released to provider
        Refunded    // 4: Escrow refunded to client (timeout or failed verification)
    }

    struct Job {
        uint256 id;
        address client;          // Buyer / employer address
        address provider;        // Autonomous Agent address (seller)
        address evaluator;       // Verification contract or oracle (TaskEvaluator)
        uint256 budget;          // Payment amount locked in native BNB (in wei)
        JobStatus status;        // Current state
        uint256 createdAt;       // Timestamp when job was opened
        uint256 expiredAt;       // Deadline after which client can trigger refund
        string taskUri;          // IPFS/JSON URI containing task instructions & parameters
        string resultUri;        // IPFS/JSON URI containing execution proof & tx hashes
    }

    // Storage
    uint256 public nextJobId;
    mapping(uint256 => Job) public jobs;
    mapping(address => uint256[]) private _clientJobs;
    mapping(address => uint256[]) private _providerJobs;

    // Events
    event JobCreated(uint256 indexed jobId, address indexed client, address indexed provider, address evaluator, uint256 budget, uint256 expiredAt, string taskUri);
    event JobFunded(uint256 indexed jobId, address indexed client, uint256 budget);
    event JobSubmitted(uint256 indexed jobId, address indexed provider, string resultUri);
    event JobCompleted(uint256 indexed jobId, address indexed provider, uint256 payout);
    event JobRefunded(uint256 indexed jobId, address indexed client, uint256 refundAmount, string reason);

    // Reentrancy guard
    uint8 private _unlocked = 1;
    modifier nonReentrant() {
        require(_unlocked == 1, "REENTRANCY_GUARD");
        _unlocked = 0;
        _;
        _unlocked = 1;
    }

    modifier onlyClient(uint256 jobId) {
        require(msg.sender == jobs[jobId].client, "ONLY_CLIENT");
        _;
    }

    modifier onlyProvider(uint256 jobId) {
        require(msg.sender == jobs[jobId].provider, "ONLY_PROVIDER");
        _;
    }

    modifier onlyEvaluatorOrClient(uint256 jobId) {
        require(
            msg.sender == jobs[jobId].evaluator || msg.sender == jobs[jobId].client,
            "ONLY_EVALUATOR_OR_CLIENT"
        );
        _;
    }

    constructor() {
        nextJobId = 1;
    }

    /**
     * @notice Create a new agentic hire job. Can be funded in the same transaction by sending msg.value.
     * @param provider Address of the hired AI agent (seller)
     * @param evaluator Address of the verification authority (TaskEvaluator contract)
     * @param durationSeconds Seconds until job reaches expiry timeout
     * @param taskUri URI containing input parameters and execution requirements
     */
    function createJob(
        address provider,
        address evaluator,
        uint256 durationSeconds,
        string calldata taskUri
    ) external payable returns (uint256 jobId) {
        require(provider != address(0), "INVALID_PROVIDER");
        require(evaluator != address(0), "INVALID_EVALUATOR");
        require(durationSeconds >= 60, "DURATION_TOO_SHORT");

        jobId = nextJobId++;
        uint256 expiredAt = block.timestamp + durationSeconds;

        JobStatus initialStatus = msg.value > 0 ? JobStatus.Funded : JobStatus.Open;

        jobs[jobId] = Job({
            id: jobId,
            client: msg.sender,
            provider: provider,
            evaluator: evaluator,
            budget: msg.value,
            status: initialStatus,
            createdAt: block.timestamp,
            expiredAt: expiredAt,
            taskUri: taskUri,
            resultUri: ""
        });

        _clientJobs[msg.sender].push(jobId);
        _providerJobs[provider].push(jobId);

        emit JobCreated(jobId, msg.sender, provider, evaluator, msg.value, expiredAt, taskUri);
        if (msg.value > 0) {
            emit JobFunded(jobId, msg.sender, msg.value);
        }
    }

    /**
     * @notice Fund an open job with escrow deposit.
     */
    function fundJob(uint256 jobId) external payable onlyClient(jobId) {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Open, "JOB_NOT_OPEN");
        require(msg.value > 0, "NO_FUNDS_SENT");

        job.budget = msg.value;
        job.status = JobStatus.Funded;

        emit JobFunded(jobId, msg.sender, msg.value);
    }

    /**
     * @notice Called by the AI agent to submit deliverables and on-chain verification proof.
     * @param jobId The job identifier
     * @param resultUri URI or JSON payload containing execution proof, state diff, and transaction hashes
     */
    function submitJob(uint256 jobId, string calldata resultUri) external onlyProvider(jobId) {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Funded, "JOB_NOT_FUNDED");
        require(bytes(resultUri).length > 0, "EMPTY_RESULT_URI");

        job.status = JobStatus.Submitted;
        job.resultUri = resultUri;

        emit JobSubmitted(jobId, msg.sender, resultUri);
    }

    /**
     * @notice Completes the job and releases escrowed payment to the agent.
     *         Callable by the designated evaluator contract after verifying proof, or by the client directly.
     */
    function completeJob(uint256 jobId) external onlyEvaluatorOrClient(jobId) nonReentrant {
        Job storage job = jobs[jobId];
        require(
            job.status == JobStatus.Submitted || job.status == JobStatus.Funded,
            "JOB_NOT_READY_FOR_COMPLETION"
        );

        job.status = JobStatus.Completed;
        uint256 payout = job.budget;

        if (payout > 0) {
            (bool success, ) = payable(job.provider).call{value: payout}("");
            require(success, "PAYOUT_TRANSFER_FAILED");
        }

        emit JobCompleted(jobId, job.provider, payout);
    }

    /**
     * @notice Refunds escrowed payment to client if the deadline has passed or evaluator rejects.
     */
    function refundJob(uint256 jobId, string calldata reason) external nonReentrant {
        Job storage job = jobs[jobId];
        require(
            job.status == JobStatus.Funded || job.status == JobStatus.Submitted,
            "JOB_CANNOT_BE_REFUNDED"
        );

        if (msg.sender == job.evaluator) {
            // Evaluator can refund at any time if validation fails
        } else if (msg.sender == job.client) {
            require(block.timestamp > job.expiredAt, "DEADLINE_NOT_PASSED");
        } else {
            revert("UNAUTHORIZED_REFUND");
        }

        job.status = JobStatus.Refunded;
        uint256 refundAmount = job.budget;

        if (refundAmount > 0) {
            (bool success, ) = payable(job.client).call{value: refundAmount}("");
            require(success, "REFUND_TRANSFER_FAILED");
        }

        emit JobRefunded(jobId, job.client, refundAmount, reason);
    }

    // View Functions
    function getJob(uint256 jobId) external view returns (Job memory) {
        return jobs[jobId];
    }

    function getClientJobs(address client) external view returns (uint256[] memory) {
        return _clientJobs[client];
    }

    function getProviderJobs(address provider) external view returns (uint256[] memory) {
        return _providerJobs[provider];
    }
}
