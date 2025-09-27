// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/// @title CitreaLotteryEngine
/// @notice Enhanced lottery engine for ChainPot on Citrea with multiple randomness sources
/// @dev Provides secure random winner selection using Bitcoin block hashes and commit-reveal schemes
contract CitreaLotteryEngine is Ownable, ReentrancyGuard, Pausable {
    
    // ==================== Constants & State ====================
    
    uint256 private nonce;
    uint64 private sequenceNumber;
    
    // Multiple randomness sources
    bool public useBlockHashRandomness = true;
    bool public useCommitRevealScheme = true;
    uint256 public commitRevealDelay = 300; // 5 minutes
    
    // Enhanced security features
    uint256 public constant MAX_PARTICIPANTS = 1000;
    uint256 public constant MIN_REVEAL_DELAY = 60; // 1 minute minimum
    uint256 public constant MAX_REVEAL_DELAY = 3600; // 1 hour maximum
    
    // ==================== Structs ====================
    
    struct RandomRequest {
        RequestType requestType;
        address[] participants;
        uint256 min;
        uint256 max;
        address requester;
        bool fulfilled;
        uint256 requestBlock;
        uint256 timestamp;
        bytes32 commitHash;
        uint256 revealDeadline;
        bool isCommitReveal;
    }
    
    struct CommitReveal {
        bytes32 commitment;
        uint256 revealValue;
        bool revealed;
        uint256 commitBlock;
        uint256 revealDeadline;
    }
    
    enum RequestType {
        WINNER_SELECTION,
        RANDOM_NUMBER,
        WEIGHTED_SELECTION
    }
    
    // ==================== Storage ====================
    
    mapping(uint64 => RandomRequest) public pendingRequests;
    mapping(address => mapping(uint64 => CommitReveal)) public commitReveals;
    mapping(uint64 => address[]) public requestRevealers;
    
    // Bitcoin-specific randomness
    mapping(uint256 => bytes32) public historicalBlockHashes;
    uint256 public lastStoredBlock;
    
    // Authorized randomness providers (for enterprise use)
    mapping(address => bool) public authorizedProviders;
    
    // ==================== Events ====================
    
    event RandomWinnerSelected(
        address indexed winner, 
        uint256 randomSeed, 
        uint64 indexed sequenceNumber,
        string method
    );
    event RandomNumberGenerated(
        uint256 randomNumber, 
        uint64 indexed sequenceNumber,
        string method
    );
    event RandomRequested(
        uint64 indexed sequenceNumber, 
        RequestType requestType,
        bool useCommitReveal
    );
    event CommitSubmitted(
        uint64 indexed sequenceNumber,
        address indexed revealer,
        bytes32 commitment
    );
    event RevealSubmitted(
        uint64 indexed sequenceNumber,
        address indexed revealer,
        uint256 revealValue
    );
    event BlockHashStored(uint256 blockNumber, bytes32 blockHash);
    event RandomnessMethodUpdated(bool blockHash, bool commitReveal);
    event AuthorizedProviderUpdated(address indexed provider, bool authorized);
    
    // ==================== Constructor ====================
    
    constructor() Ownable(msg.sender) {
        nonce = 1;
        sequenceNumber = 1;
        lastStoredBlock = block.number;
        
        // Store initial block hash
        historicalBlockHashes[block.number] = blockhash(block.number - 1);
    }
    
    // ==================== Admin Functions ====================
    
    function setRandomnessMethod(bool _useBlockHash, bool _useCommitReveal) external onlyOwner {
        require(_useBlockHash || _useCommitReveal, "At least one method must be enabled");
        useBlockHashRandomness = _useBlockHash;
        useCommitRevealScheme = _useCommitReveal;
        emit RandomnessMethodUpdated(_useBlockHash, _useCommitReveal);
    }
    
    function setCommitRevealDelay(uint256 _delay) external onlyOwner {
        require(_delay >= MIN_REVEAL_DELAY && _delay <= MAX_REVEAL_DELAY, "Invalid delay");
        commitRevealDelay = _delay;
    }
    
    function setAuthorizedProvider(address provider, bool authorized) external onlyOwner {
        require(provider != address(0), "Invalid provider");
        authorizedProviders[provider] = authorized;
        emit AuthorizedProviderUpdated(provider, authorized);
    }
    
    function storeBlockHash(uint256 blockNumber) external {
        require(blockNumber < block.number, "Block not yet mined");
        require(block.number - blockNumber <= 256, "Block hash unavailable");
        
        bytes32 blockHash = blockhash(blockNumber);
        require(blockHash != bytes32(0), "Invalid block hash");
        
        historicalBlockHashes[blockNumber] = blockHash;
        if (blockNumber > lastStoredBlock) {
            lastStoredBlock = blockNumber;
        }
        
        emit BlockHashStored(blockNumber, blockHash);
    }
    
    // ==================== Core Randomness Functions ====================
    
    /// @notice Select a random winner from participants using multiple randomness sources
    /// @param participants Array of participant addresses
    /// @param useCommitReveal Whether to use commit-reveal scheme for this request
    /// @return sequenceNum The sequence number for tracking this request
    function selectRandomWinner(
        address[] memory participants,
        bool useCommitReveal
    ) external whenNotPaused returns (uint64 sequenceNum) {
        require(participants.length > 0 && participants.length <= MAX_PARTICIPANTS, "Invalid participant count");
        require(useBlockHashRandomness || useCommitRevealScheme, "No randomness method enabled");
        
        sequenceNum = sequenceNumber++;
        
        // Create request
        pendingRequests[sequenceNum] = RandomRequest({
            requestType: RequestType.WINNER_SELECTION,
            participants: participants,
            min: 0,
            max: 0,
            requester: msg.sender,
            fulfilled: false,
            requestBlock: block.number,
            timestamp: block.timestamp,
            commitHash: bytes32(0),
            revealDeadline: block.timestamp + commitRevealDelay,
            isCommitReveal: useCommitReveal && useCommitRevealScheme
        });
        
        emit RandomRequested(sequenceNum, RequestType.WINNER_SELECTION, useCommitReveal);
        
        // If not using commit-reveal, try immediate resolution
        if (!useCommitReveal || !useCommitRevealScheme) {
            _tryResolveRequest(sequenceNum);
        }
        
        return sequenceNum;
    }
    
    /// @notice Overloaded function for backward compatibility (defaults to block hash method)
    function selectRandomWinner(address[] memory participants) 
        external 
        whenNotPaused 
        returns (uint64) 
    {
        return this.selectRandomWinner(participants, false);
    }
    
    /// @notice Generate a random number within a range
    /// @param min Minimum value (inclusive)
    /// @param max Maximum value (exclusive)
    /// @param useCommitReveal Whether to use commit-reveal scheme
    /// @return sequenceNum The sequence number for tracking this request
    function getRandomNumber(
        uint256 min, 
        uint256 max,
        bool useCommitReveal
    ) external whenNotPaused returns (uint64 sequenceNum) {
        require(max > min, "Invalid range");
        require(max - min <= type(uint128).max, "Range too large");
        
        sequenceNum = sequenceNumber++;
        address[] memory emptyArray;
        
        pendingRequests[sequenceNum] = RandomRequest({
            requestType: RequestType.RANDOM_NUMBER,
            participants: emptyArray,
            min: min,
            max: max,
            requester: msg.sender,
            fulfilled: false,
            requestBlock: block.number,
            timestamp: block.timestamp,
            commitHash: bytes32(0),
            revealDeadline: block.timestamp + commitRevealDelay,
            isCommitReveal: useCommitReveal && useCommitRevealScheme
        });
        
        emit RandomRequested(sequenceNum, RequestType.RANDOM_NUMBER, useCommitReveal);
        
        if (!useCommitReveal || !useCommitRevealScheme) {
            _tryResolveRequest(sequenceNum);
        }
        
        return sequenceNum;
    }
    
    /// @notice Overloaded function for backward compatibility
    function getRandomNumber(uint256 min, uint256 max) 
        external 
        whenNotPaused 
        returns (uint64) 
    {
        return this.getRandomNumber(min, max, false);
    }
    
    // ==================== Commit-Reveal Implementation ====================
    
    /// @notice Submit commitment for randomness generation
    /// @param sequenceNum The sequence number of the request
    /// @param commitment Keccak256 hash of (secret + salt)
    function submitCommitment(uint64 sequenceNum, bytes32 commitment) 
        external 
        whenNotPaused 
        nonReentrant 
    {
        RandomRequest storage request = pendingRequests[sequenceNum];
        require(request.requester != address(0), "Request not found");
        require(request.isCommitReveal, "Not a commit-reveal request");
        require(!request.fulfilled, "Request already fulfilled");
        require(block.timestamp < request.revealDeadline, "Commitment period ended");
        require(commitment != bytes32(0), "Invalid commitment");
        
        CommitReveal storage commitReveal = commitReveals[msg.sender][sequenceNum];
        require(!commitReveal.revealed, "Already revealed");
        
        // Allow overwriting commitment if not yet revealed
        if (commitReveal.commitment == bytes32(0)) {
            requestRevealers[sequenceNum].push(msg.sender);
        }
        
        commitReveal.commitment = commitment;
        commitReveal.commitBlock = block.number;
        commitReveal.revealDeadline = request.revealDeadline;
        
        emit CommitSubmitted(sequenceNum, msg.sender, commitment);
    }
    
    /// @notice Reveal the committed value
    /// @param sequenceNum The sequence number of the request
    /// @param secret The secret value used in commitment
    /// @param salt Additional salt used in commitment
    function revealCommitment(
        uint64 sequenceNum, 
        uint256 secret, 
        uint256 salt
    ) external whenNotPaused nonReentrant {
        RandomRequest storage request = pendingRequests[sequenceNum];
        require(request.requester != address(0), "Request not found");
        require(request.isCommitReveal, "Not a commit-reveal request");
        require(!request.fulfilled, "Request already fulfilled");
        
        CommitReveal storage commitReveal = commitReveals[msg.sender][sequenceNum];
        require(commitReveal.commitment != bytes32(0), "No commitment found");
        require(!commitReveal.revealed, "Already revealed");
        require(block.timestamp <= commitReveal.revealDeadline, "Reveal period ended");
        
        // Verify commitment
        bytes32 expectedCommitment = keccak256(abi.encodePacked(secret, salt, msg.sender));
        require(commitReveal.commitment == expectedCommitment, "Invalid reveal");
        
        commitReveal.revealValue = secret;
        commitReveal.revealed = true;
        
        emit RevealSubmitted(sequenceNum, msg.sender, secret);
        
        // Try to resolve if we have enough reveals
        _tryResolveCommitRevealRequest(sequenceNum);
    }
    
    // ==================== Internal Resolution Logic ====================
    
    function _tryResolveRequest(uint64 sequenceNum) internal {
        RandomRequest storage request = pendingRequests[sequenceNum];
        if (request.fulfilled) return;
        
        uint256 randomValue = _generateRandomValue(sequenceNum);
        _finalizeRequest(sequenceNum, randomValue, "BlockHash");
    }
    
    function _tryResolveCommitRevealRequest(uint64 sequenceNum) internal {
        RandomRequest storage request = pendingRequests[sequenceNum];
        if (request.fulfilled) return;
        
        // Check if we have at least one reveal
        address[] storage revealers = requestRevealers[sequenceNum];
        uint256 validReveals = 0;
        
        for (uint256 i = 0; i < revealers.length; i++) {
            if (commitReveals[revealers[i]][sequenceNum].revealed) {
                validReveals++;
            }
        }
        
        // Need at least one reveal, or reveal period ended
        if (validReveals == 0 && block.timestamp <= request.revealDeadline) {
            return; // Wait for more reveals
        }
        
        uint256 randomValue;
        string memory method;
        
        if (validReveals > 0) {
            randomValue = _generateCommitRevealRandomValue(sequenceNum);
            method = "CommitReveal";
        } else {
            // Fallback to block hash if no reveals
            randomValue = _generateRandomValue(sequenceNum);
            method = "BlockHashFallback";
        }
        
        _finalizeRequest(sequenceNum, randomValue, method);
    }
    
    function _generateRandomValue(uint64 sequenceNum) internal returns (uint256) {
        RandomRequest storage request = pendingRequests[sequenceNum];
        
        // Combine multiple entropy sources
        uint256 entropy = uint256(keccak256(abi.encodePacked(
            blockhash(request.requestBlock > 0 ? request.requestBlock - 1 : block.number - 1),
            blockhash(block.number - 1),
            historicalBlockHashes[lastStoredBlock],
            block.timestamp,
            block.difficulty,
            request.timestamp,
            request.requester,
            nonce++,
            sequenceNum
        )));
        
        return entropy;
    }
    
    function _generateCommitRevealRandomValue(uint64 sequenceNum) internal view returns (uint256) {
        address[] storage revealers = requestRevealers[sequenceNum];
        uint256 combinedEntropy = 0;
        uint256 revealCount = 0;
        
        // Combine all revealed values
        for (uint256 i = 0; i < revealers.length; i++) {
            CommitReveal storage reveal = commitReveals[revealers[i]][sequenceNum];
            if (reveal.revealed) {
                combinedEntropy ^= reveal.revealValue;
                revealCount++;
            }
        }
        
        // Add additional entropy sources
        combinedEntropy = uint256(keccak256(abi.encodePacked(
            combinedEntropy,
            blockhash(block.number - 1),
            block.timestamp,
            revealCount,
            sequenceNum
        )));
        
        return combinedEntropy;
    }
    
    function _finalizeRequest(uint64 sequenceNum, uint256 randomValue, string memory method) internal {
        RandomRequest storage request = pendingRequests[sequenceNum];
        request.fulfilled = true;
        
        if (request.requestType == RequestType.WINNER_SELECTION) {
            uint256 winnerIndex = randomValue % request.participants.length;
            address winner = request.participants[winnerIndex];
            emit RandomWinnerSelected(winner, randomValue, sequenceNum, method);
        } else if (request.requestType == RequestType.RANDOM_NUMBER) {
            uint256 result = request.min + (randomValue % (request.max - request.min));
            emit RandomNumberGenerated(result, sequenceNum, method);
        }
    }
    
    // ==================== Manual Resolution ====================
    
    /// @notice Manually resolve a request (owner only, for emergencies)
    function manualResolveRequest(uint64 sequenceNum, string memory reason) 
        external 
        onlyOwner 
        nonReentrant 
    {
        RandomRequest storage request = pendingRequests[sequenceNum];
        require(request.requester != address(0), "Request not found");
        require(!request.fulfilled, "Request already fulfilled");
        require(bytes(reason).length > 0, "Must provide reason");
        
        // Use current block entropy for manual resolution
        uint256 randomValue = uint256(keccak256(abi.encodePacked(
            blockhash(block.number - 1),
            block.timestamp,
            block.difficulty,
            sequenceNum,
            reason
        )));
        
        _finalizeRequest(sequenceNum, randomValue, string(abi.encodePacked("Manual:", reason)));
    }
    
    // ==================== View Functions ====================
    
    function previewRandomWinner(address[] memory participants) 
        external 
        view 
        returns (address) 
    {
        require(participants.length > 0, "No participants");
        
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(
            blockhash(block.number - 1),
            block.timestamp,
            block.difficulty,
            msg.sender,
            nonce
        )));
        
        uint256 winnerIndex = randomSeed % participants.length;
        return participants[winnerIndex];
    }
    
    function getRequest(uint64 sequenceNum) 
        external 
        view 
        returns (RandomRequest memory) 
    {
        return pendingRequests[sequenceNum];
    }
    
    function isRequestFulfilled(uint64 sequenceNum) 
        external 
        view 
        returns (bool) 
    {
        return pendingRequests[sequenceNum].fulfilled;
    }
    
    function getCommitReveal(address revealer, uint64 sequenceNum) 
        external 
        view 
        returns (CommitReveal memory) 
    {
        return commitReveals[revealer][sequenceNum];
    }
    
    function getRevealersForRequest(uint64 sequenceNum) 
        external 
        view 
        returns (address[] memory) 
    {
        return requestRevealers[sequenceNum];
    }
    
    function getRevealStats(uint64 sequenceNum) 
        external 
        view 
        returns (
            uint256 totalRevealers,
            uint256 revealedCount,
            uint256 pendingCount
        ) 
    {
        address[] storage revealers = requestRevealers[sequenceNum];
        totalRevealers = revealers.length;
        
        for (uint256 i = 0; i < revealers.length; i++) {
            if (commitReveals[revealers[i]][sequenceNum].revealed) {
                revealedCount++;
            }
        }
        
        pendingCount = totalRevealers - revealedCount;
    }
    
    // ==================== Emergency Functions ====================
    
    function emergencyPause() external onlyOwner {
        _pause();
    }
    
    function emergencyUnpause() external onlyOwner {
        _unpause();
    }
    
    function withdraw(address to, uint256 amount) 
        external 
        onlyOwner 
        nonReentrant 
    {
        require(to != address(0), "Invalid recipient");
        require(amount <= address(this).balance, "Insufficient balance");
        
        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "Withdrawal failed");
    }
    
    // ==================== Receive Function ====================
    
    receive() external payable {
        // Allow contract to receive BTC for gas/fees
    }
    
    fallback() external payable {
        revert("Function not found");
    }
}