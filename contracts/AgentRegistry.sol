// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgentRegistry
 * @notice ERC-8004 Trustless Agent Identity & Capabilities Registry on BNB Smart Chain.
 * @dev Stores autonomous agent metadata, category, pricing, endpoint, and provider addresses on-chain.
 */
contract AgentRegistry {
    address public owner;

    struct AgentProfile {
        string agentId;          // e.g. "rangeguard"
        string name;             // e.g. "RangeGuard"
        string category;         // e.g. "rebalancing"
        address providerAddress; // Provider wallet that receives escrow payouts
        uint256 minBudgetWei;    // Minimum hire budget in wei
        string metadataUri;      // IPFS or HTTP URI with agent capabilities & specs
        bool active;             // Whether agent is accepting hire orders
        uint256 jobsCompleted;   // Verified jobs counter
        uint256 registeredAt;    // Registration block timestamp
    }

    // Storage
    mapping(string => AgentProfile) private _agents;
    string[] private _agentIds;

    // Events
    event AgentRegistered(string indexed agentId, string name, string category, address indexed provider, uint256 minBudgetWei);
    event AgentUpdated(string indexed agentId, bool active, uint256 minBudgetWei, string metadataUri);
    event AgentJobIncremented(string indexed agentId, uint256 totalCompleted);

    modifier onlyOwner() {
        require(msg.sender == owner, "ONLY_OWNER");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Register a new autonomous agent on-chain.
     */
    function registerAgent(
        string calldata agentId,
        string calldata name,
        string calldata category,
        address providerAddress,
        uint256 minBudgetWei,
        string calldata metadataUri
    ) external onlyOwner {
        require(bytes(agentId).length > 0, "INVALID_ID");
        require(providerAddress != address(0), "INVALID_PROVIDER");
        require(_agents[agentId].providerAddress == address(0), "AGENT_EXISTS");

        _agents[agentId] = AgentProfile({
            agentId: agentId,
            name: name,
            category: category,
            providerAddress: providerAddress,
            minBudgetWei: minBudgetWei,
            metadataUri: metadataUri,
            active: true,
            jobsCompleted: 0,
            registeredAt: block.timestamp
        });

        _agentIds.push(agentId);
        emit AgentRegistered(agentId, name, category, providerAddress, minBudgetWei);
    }

    /**
     * @notice Update existing agent status or parameters.
     */
    function updateAgent(
        string calldata agentId,
        bool active,
        uint256 minBudgetWei,
        string calldata metadataUri
    ) external {
        AgentProfile storage profile = _agents[agentId];
        require(profile.providerAddress != address(0), "AGENT_NOT_FOUND");
        require(msg.sender == owner || msg.sender == profile.providerAddress, "UNAUTHORIZED");

        profile.active = active;
        profile.minBudgetWei = minBudgetWei;
        profile.metadataUri = metadataUri;

        emit AgentUpdated(agentId, active, minBudgetWei, metadataUri);
    }

    /**
     * @notice Increment verified job count when Evaluator approves work.
     */
    function recordJobCompleted(string calldata agentId) external onlyOwner {
        AgentProfile storage profile = _agents[agentId];
        require(profile.providerAddress != address(0), "AGENT_NOT_FOUND");
        profile.jobsCompleted++;
        emit AgentJobIncremented(agentId, profile.jobsCompleted);
    }

    /**
     * @notice Get single agent profile by ID.
     */
    function getAgent(string calldata agentId) external view returns (AgentProfile memory) {
        require(_agents[agentId].providerAddress != address(0), "AGENT_NOT_FOUND");
        return _agents[agentId];
    }

    /**
     * @notice Returns all registered agent IDs.
     */
    function getAllAgentIds() external view returns (string[] memory) {
        return _agentIds;
    }

    /**
     * @notice Total number of registered agents.
     */
    function getAgentCount() external view returns (uint256) {
        return _agentIds.length;
    }
}
