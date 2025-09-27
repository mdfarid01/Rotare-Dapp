// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MemberAccountManager.sol";
import "./LotteryEngine.sol";
import "./CitreaEscrow.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/// @title CitreaAuctionEngine
/// @notice Enhanced auction engine for ChainPot on Citrea with native BTC yield integration
/// @dev Core logic for managing pots, cycles, bidding, and winner selection with BTC staking yields
contract CitreaAuctionEngine is Ownable, ReentrancyGuard, Pausable {
    using EnumerableSet for EnumerableSet.AddressSet;

    // ==================== Contract References ====================

    MemberAccountManager public memberManager;
    CitreaLotteryEngine public lotteryEngine;
    CitreaEscrow public escrow;

    // ==================== Enums ====================

    enum CycleFrequency {
        Monthly,
        BiWeekly,
        Weekly,
        Daily
    }
    enum PotStatus {
        Active,
        Paused,
        Completed,
        Cancelled
    }
    enum CycleStatus {
        Pending,
        Active,
        BiddingClosed,
        Completed,
        Cancelled
    }

    // ==================== Structs ====================

    struct Pot {
        string name;
        address creator;
        uint256 amountPerCycle;
        uint256 cycleDuration;
        uint256 cycleCount;
        uint256 completedCycles;
        CycleFrequency frequency;
        uint256 bidDepositDeadline; // seconds before cycle end
        PotStatus status;
        address[] members;
        uint256[] cycleIds;
        uint256 createdAt;
        uint256 minMembers;
        uint256 maxMembers;
        uint256 totalYieldGenerated; // Total BTC yield generated
        bool autoYieldDistribution; // Auto-distribute yield to members
    }

    struct AuctionCycle {
        uint256 potId;
        uint256 cycleId;
        uint256 startTime;
        uint256 endTime;
        address winner;
        uint256 winningBid;
        address lowestBidder;
        CycleStatus status;
        mapping(address => uint256) bids;
        EnumerableSet.AddressSet participants;
        uint256 totalDeposited;
        uint256 totalYieldGenerated;
        bool fundsReleased;
        bool yieldDistributed;
    }

    // ==================== State Variables ====================

    uint256 public potCounter = 1;
    uint256 public cycleCounter = 1;

    mapping(uint256 => Pot) public chainPots;
    mapping(uint256 => AuctionCycle) private auctionCycles;
    mapping(uint256 => mapping(address => bool)) public hasJoinedPot;
    mapping(address => uint256[]) public userPots;

    // Enhanced features for Citrea
    mapping(uint256 => uint256) public potMinimumYieldThreshold; // Minimum yield before distribution
    mapping(uint256 => bool) public potYieldReinvestment; // Auto-reinvest yield into pot

    // Constants
    uint256 public constant MIN_CYCLE_DURATION = 1 days;
    uint256 public constant MAX_CYCLE_DURATION = 90 days;
    uint256 public constant MIN_BID_DEADLINE = 1 hours;
    uint256 public constant MAX_MEMBERS = 100;
    uint256 public constant MIN_AMOUNT_PER_CYCLE = 0.001 ether; // 0.001 BTC minimum

    // ==================== Events ====================

    event PotCreated(
        uint256 indexed potId,
        string name,
        address indexed creator,
        uint256 amountPerCycle,
        bool autoYieldDistribution
    );
    event JoinedPot(uint256 indexed potId, address indexed user);
    event LeftPot(uint256 indexed potId, address indexed user);
    event CycleStarted(
        uint256 indexed cycleId,
        uint256 indexed potId,
        uint256 startTime,
        uint256 endTime
    );
    event BidPlaced(
        uint256 indexed cycleId,
        address indexed bidder,
        uint256 amount
    );
    event WinnerDeclared(
        uint256 indexed cycleId,
        address indexed winner,
        uint256 amount,
        bool isLottery
    );
    event CycleCompleted(
        uint256 indexed cycleId,
        uint256 indexed potId,
        uint256 totalYield
    );
    event YieldDistributed(
        uint256 indexed cycleId,
        uint256 totalYield,
        uint256 recipientCount
    );
    event PotStatusChanged(uint256 indexed potId, PotStatus status);
    event YieldThresholdUpdated(uint256 indexed potId, uint256 threshold);
    event EmergencyAction(uint256 indexed potId, string action, string reason);

    // ==================== Constructor ====================

    constructor(
        address _memberManager,
        address payable _lotteryEngine,
        address payable _escrow
    ) Ownable(msg.sender) {
        require(_memberManager != address(0), "Invalid member manager");
        require(_lotteryEngine != address(0), "Invalid lottery engine");
        require(_escrow != address(0), "Invalid escrow");

        memberManager = MemberAccountManager(_memberManager);
        lotteryEngine = CitreaLotteryEngine(_lotteryEngine);
        escrow = CitreaEscrow(_escrow);
    }

    // ==================== Modifiers ====================

    modifier onlyRegistered() {
        require(memberManager.isRegistered(msg.sender), "Not registered");
        _;
    }

    modifier onlyPotCreator(uint256 potId) {
        require(chainPots[potId].creator == msg.sender, "Not pot creator");
        _;
    }

    modifier validPot(uint256 potId) {
        require(potId > 0 && potId < potCounter, "Invalid pot ID");
        require(chainPots[potId].creator != address(0), "Pot does not exist");
        _;
    }

    modifier validCycle(uint256 cycleId) {
        require(cycleId > 0 && cycleId < cycleCounter, "Invalid cycle ID");
        _;
    }

    // ==================== Core Pot Management ====================

    function createPot(
        string memory name,
        uint256 amountPerCycle,
        uint256 cycleDuration,
        uint256 cycleCount,
        CycleFrequency frequency,
        uint256 bidDepositDeadline,
        uint256 minMembers,
        uint256 maxMembers,
        bool autoYieldDistribution
    ) external onlyRegistered whenNotPaused returns (uint256) {
        require(
            bytes(name).length > 0 && bytes(name).length <= 100,
            "Invalid name length"
        );
        require(amountPerCycle >= MIN_AMOUNT_PER_CYCLE, "Amount too low");
        require(
            cycleDuration >= MIN_CYCLE_DURATION &&
                cycleDuration <= MAX_CYCLE_DURATION,
            "Invalid cycle duration"
        );
        require(
            bidDepositDeadline >= MIN_BID_DEADLINE &&
                bidDepositDeadline < cycleDuration,
            "Invalid bid deadline"
        );
        require(cycleCount > 0 && cycleCount <= 100, "Invalid cycle count");
        require(
            minMembers >= 2 && minMembers <= maxMembers,
            "Invalid member limits"
        );
        require(maxMembers <= MAX_MEMBERS, "Too many members");

        uint256 potId = potCounter++;

        Pot storage pot = chainPots[potId];
        pot.name = name;
        pot.creator = msg.sender;
        pot.amountPerCycle = amountPerCycle;
        pot.cycleDuration = cycleDuration;
        pot.cycleCount = cycleCount;
        pot.frequency = frequency;
        pot.bidDepositDeadline = bidDepositDeadline;
        pot.status = PotStatus.Active;
        pot.createdAt = block.timestamp;
        pot.minMembers = minMembers;
        pot.maxMembers = maxMembers;
        pot.autoYieldDistribution = autoYieldDistribution;

        // Creator automatically joins
        pot.members.push(msg.sender);
        hasJoinedPot[potId][msg.sender] = true;
        userPots[msg.sender].push(potId);

        // Set default yield threshold (1% of cycle amount)
        potMinimumYieldThreshold[potId] = amountPerCycle / 100;

        // Register with member manager
        memberManager.updateParticipation(msg.sender, potId, 0, 0, true);

        emit PotCreated(
            potId,
            name,
            msg.sender,
            amountPerCycle,
            autoYieldDistribution
        );
        emit JoinedPot(potId, msg.sender);
        return potId;
    }

    function joinPot(
        uint256 potId
    ) external onlyRegistered validPot(potId) whenNotPaused nonReentrant {
        Pot storage pot = chainPots[potId];
        require(pot.status == PotStatus.Active, "Pot not active");
        require(!hasJoinedPot[potId][msg.sender], "Already joined");
        require(pot.members.length < pot.maxMembers, "Pot is full");
        require(pot.completedCycles == 0, "Pot already started");

        // Check user reputation (optional enhanced feature)
        uint256 userReputation = memberManager.getReputationScore(msg.sender);
        require(userReputation >= 50, "Reputation too low"); // Minimum reputation check

        pot.members.push(msg.sender);
        hasJoinedPot[potId][msg.sender] = true;
        userPots[msg.sender].push(potId);

        emit JoinedPot(potId, msg.sender);
    }

    function leavePot(
        uint256 potId
    ) external validPot(potId) whenNotPaused nonReentrant {
        Pot storage pot = chainPots[potId];
        require(hasJoinedPot[potId][msg.sender], "Not a member");
        require(pot.completedCycles == 0, "Cannot leave after pot started");
        require(msg.sender != pot.creator, "Creator cannot leave");

        // Remove from members array
        for (uint256 i = 0; i < pot.members.length; i++) {
            if (pot.members[i] == msg.sender) {
                pot.members[i] = pot.members[pot.members.length - 1];
                pot.members.pop();
                break;
            }
        }

        hasJoinedPot[potId][msg.sender] = false;

        // Remove from user's pot list
        uint256[] storage userPotList = userPots[msg.sender];
        for (uint256 i = 0; i < userPotList.length; i++) {
            if (userPotList[i] == potId) {
                userPotList[i] = userPotList[userPotList.length - 1];
                userPotList.pop();
                break;
            }
        }

        emit LeftPot(potId, msg.sender);
    }

    // ==================== Cycle Management ====================

    function startCycle(
        uint256 potId
    )
        external
        onlyPotCreator(potId)
        validPot(potId)
        whenNotPaused
        nonReentrant
    {
        Pot storage pot = chainPots[potId];
        require(pot.status == PotStatus.Active, "Pot not active");
        require(pot.members.length >= pot.minMembers, "Not enough members");
        require(pot.completedCycles < pot.cycleCount, "All cycles completed");

        uint256 cycleId = cycleCounter++;

        AuctionCycle storage cycle = auctionCycles[cycleId];
        cycle.potId = potId;
        cycle.cycleId = cycleId;
        cycle.startTime = block.timestamp;
        cycle.endTime = block.timestamp + pot.cycleDuration;
        cycle.status = CycleStatus.Active;

        pot.cycleIds.push(cycleId);

        // Collect deposits from all members via escrow (which stakes in yield manager)
        address[] memory members = pot.members;
        uint256[] memory amounts = new uint256[](members.length);

        // All members contribute the same amount
        for (uint256 i = 0; i < members.length; i++) {
            amounts[i] = pot.amountPerCycle;
            // Update member participation
            memberManager.updateParticipation(
                members[i],
                potId,
                cycleId,
                pot.amountPerCycle,
                members[i] == pot.creator
            );
        }

        // Batch deposit to escrow (which will stake in yield manager)
        uint256 totalAmount = pot.amountPerCycle * pot.members.length;
        escrow.batchDeposit{value: totalAmount}(
            potId,
            cycleId,
            members,
            amounts
        );

        cycle.totalDeposited = totalAmount;

        emit CycleStarted(cycleId, potId, cycle.startTime, cycle.endTime);
    }

    function placeBid(
        uint256 cycleId,
        uint256 bidAmount
    )
        external
        payable
        onlyRegistered
        validCycle(cycleId)
        whenNotPaused
        nonReentrant
    {
        AuctionCycle storage cycle = auctionCycles[cycleId];
        Pot storage pot = chainPots[cycle.potId];

        require(cycle.status == CycleStatus.Active, "Cycle not active");
        require(hasJoinedPot[cycle.potId][msg.sender], "Not a pot member");
        require(
            block.timestamp < cycle.endTime - pot.bidDepositDeadline,
            "Bid deadline passed"
        );
        require(
            bidAmount > 0 && bidAmount <= pot.amountPerCycle,
            "Invalid bid amount"
        );
        require(msg.value == bidAmount, "Incorrect payment");

        // Store bid (overwrite if user bids again)
        if (cycle.bids[msg.sender] == 0) {
            cycle.participants.add(msg.sender);
        }
        cycle.bids[msg.sender] = bidAmount;

        // Update member manager
        memberManager.updateBidInfo(
            msg.sender,
            cycle.potId,
            cycleId,
            bidAmount,
            true
        );

        emit BidPlaced(cycleId, msg.sender, bidAmount);
    }

    function closeBidding(
        uint256 cycleId
    )
        external
        onlyPotCreator(auctionCycles[cycleId].potId)
        validCycle(cycleId)
        whenNotPaused
    {
        AuctionCycle storage cycle = auctionCycles[cycleId];
        require(cycle.status == CycleStatus.Active, "Cycle not active");
        require(
            block.timestamp >=
                cycle.endTime - chainPots[cycle.potId].bidDepositDeadline,
            "Too early to close"
        );

        cycle.status = CycleStatus.BiddingClosed;
    }

    function declareWinner(
        uint256 cycleId
    )
        external
        onlyPotCreator(auctionCycles[cycleId].potId)
        validCycle(cycleId)
        whenNotPaused
    {
        AuctionCycle storage cycle = auctionCycles[cycleId];
        require(
            cycle.status == CycleStatus.BiddingClosed,
            "Bidding not closed"
        );

        Pot storage pot = chainPots[cycle.potId];
        bool isLottery = false;

        if (cycle.participants.length() == 0) {
            // No bids - use lottery
            uint64 winnerIndex = lotteryEngine.selectRandomWinner(pot.members);
            cycle.winner = pot.members[winnerIndex]; // Convert index to address            cycle.winningBid = pot.amountPerCycle;
            isLottery = true;
        } else {
            // Find lowest bidder
            address lowestBidder = address(0);
            uint256 lowestBid = type(uint256).max;

            for (uint256 i = 0; i < cycle.participants.length(); i++) {
                address participant = cycle.participants.at(i);
                uint256 bid = cycle.bids[participant];

                if (bid < lowestBid) {
                    lowestBid = bid;
                    lowestBidder = participant;
                }
            }

            cycle.winner = lowestBidder;
            cycle.winningBid = lowestBid;
            cycle.lowestBidder = lowestBidder;
        }

        // Mark as winner in member manager
        memberManager.markAsWinner(cycle.winner, cycle.potId, cycleId);

        emit WinnerDeclared(cycleId, cycle.winner, cycle.winningBid, isLottery);
    }

    function completeCycle(
        uint256 cycleId
    )
        external
        onlyPotCreator(auctionCycles[cycleId].potId)
        validCycle(cycleId)
        whenNotPaused
        nonReentrant
    {
        AuctionCycle storage cycle = auctionCycles[cycleId];
        require(cycle.winner != address(0), "Winner not declared");
        require(cycle.status != CycleStatus.Completed, "Already completed");
        require(block.timestamp >= cycle.endTime, "Cycle not ended");
        require(!cycle.fundsReleased, "Funds already released");

        Pot storage pot = chainPots[cycle.potId];

        // Release winning amount to winner via escrow (which handles yield)
        escrow.releaseFundsToWinner(
            cycle.winningBid,
            payable(cycle.winner),
            cycleId
        );
        cycle.fundsReleased = true;

        // Calculate and distribute yield if auto-distribution is enabled
        if (pot.autoYieldDistribution) {
            _distributeYieldToCycleMembers(cycleId);
        }

        // Complete the cycle in escrow
        escrow.completeCycle(cycleId);

        cycle.status = CycleStatus.Completed;
        pot.completedCycles++;

        // Check if all cycles completed
        if (pot.completedCycles >= pot.cycleCount) {
            pot.status = PotStatus.Completed;
            emit PotStatusChanged(cycle.potId, PotStatus.Completed);
        }

        emit CycleCompleted(cycleId, cycle.potId, cycle.totalYieldGenerated);
    }

    // ==================== Yield Management ====================

    function _distributeYieldToCycleMembers(uint256 cycleId) internal {
        AuctionCycle storage cycle = auctionCycles[cycleId];
        Pot storage pot = chainPots[cycle.potId];

        if (cycle.yieldDistributed) return;

        // Get yield estimate from escrow
        uint256 cycleDuration = cycle.endTime - cycle.startTime;
        uint256 estimatedYield = escrow.estimateCycleYield(
            cycleId,
            cycleDuration
        );

        if (estimatedYield < potMinimumYieldThreshold[cycle.potId]) {
            return; // Yield too low to distribute
        }

        // Prepare distribution arrays (exclude winner)
        address[] memory recipients = new address[](pot.members.length - 1);
        uint256[] memory amounts = new uint256[](pot.members.length - 1);
        uint256 yieldPerMember = estimatedYield / (pot.members.length - 1);

        uint256 recipientIndex = 0;
        for (uint256 i = 0; i < pot.members.length; i++) {
            if (pot.members[i] != cycle.winner) {
                recipients[recipientIndex] = pot.members[i];
                amounts[recipientIndex] = yieldPerMember;
                recipientIndex++;
            }
        }

        // Distribute yield via escrow
        if (recipients.length > 0) {
            escrow.distributeYieldToContributors(cycleId, recipients, amounts);
            cycle.totalYieldGenerated = estimatedYield;
            cycle.yieldDistributed = true;
            pot.totalYieldGenerated += estimatedYield;

            emit YieldDistributed(cycleId, estimatedYield, recipients.length);
        }
    }

    function manualDistributeYield(
        uint256 cycleId
    )
        external
        onlyPotCreator(auctionCycles[cycleId].potId)
        validCycle(cycleId)
        whenNotPaused
    {
        AuctionCycle storage cycle = auctionCycles[cycleId];
        require(cycle.status == CycleStatus.Completed, "Cycle not completed");
        require(!cycle.yieldDistributed, "Yield already distributed");

        _distributeYieldToCycleMembers(cycleId);
    }

    function setYieldThreshold(
        uint256 potId,
        uint256 threshold
    ) external onlyPotCreator(potId) validPot(potId) {
        require(threshold > 0, "Threshold must be > 0");
        potMinimumYieldThreshold[potId] = threshold;
        emit YieldThresholdUpdated(potId, threshold);
    }

    function toggleYieldReinvestment(
        uint256 potId,
        bool enable
    ) external onlyPotCreator(potId) validPot(potId) {
        potYieldReinvestment[potId] = enable;
    }

    // ==================== Admin Functions ====================

    function pausePot(
        uint256 potId
    ) external onlyPotCreator(potId) validPot(potId) {
        require(chainPots[potId].status == PotStatus.Active, "Pot not active");
        chainPots[potId].status = PotStatus.Paused;
        emit PotStatusChanged(potId, PotStatus.Paused);
    }

    function resumePot(
        uint256 potId
    ) external onlyPotCreator(potId) validPot(potId) {
        require(chainPots[potId].status == PotStatus.Paused, "Pot not paused");
        chainPots[potId].status = PotStatus.Active;
        emit PotStatusChanged(potId, PotStatus.Active);
    }

    function cancelPot(
        uint256 potId,
        string memory reason
    ) external onlyPotCreator(potId) validPot(potId) whenNotPaused {
        Pot storage pot = chainPots[potId];
        require(pot.completedCycles == 0, "Cannot cancel started pot");
        require(bytes(reason).length > 0, "Must provide reason");

        pot.status = PotStatus.Cancelled;
        emit PotStatusChanged(potId, PotStatus.Cancelled);
        emit EmergencyAction(potId, "CANCELLED", reason);
    }

    // ==================== View Functions ====================

    function getCycleInfo(
        uint256 cycleId
    )
        external
        view
        validCycle(cycleId)
        returns (
            uint256 potId,
            uint256 startTime,
            uint256 endTime,
            address winner,
            uint256 winningBid,
            CycleStatus status,
            uint256 participantCount,
            uint256 totalDeposited,
            uint256 totalYieldGenerated,
            bool yieldDistributed
        )
    {
        AuctionCycle storage cycle = auctionCycles[cycleId];
        return (
            cycle.potId,
            cycle.startTime,
            cycle.endTime,
            cycle.winner,
            cycle.winningBid,
            cycle.status,
            cycle.participants.length(),
            cycle.totalDeposited,
            cycle.totalYieldGenerated,
            cycle.yieldDistributed
        );
    }

    function getPotInfo(
        uint256 potId
    )
        external
        view
        validPot(potId)
        returns (
            string memory name,
            address creator,
            uint256 amountPerCycle,
            uint256 cycleDuration,
            uint256 cycleCount,
            uint256 completedCycles,
            CycleFrequency frequency,
            uint256 bidDepositDeadline,
            PotStatus status,
            address[] memory members,
            uint256[] memory cycleIds,
            uint256 totalYieldGenerated,
            bool autoYieldDistribution
        )
    {
        Pot storage pot = chainPots[potId];
        return (
            pot.name,
            pot.creator,
            pot.amountPerCycle,
            pot.cycleDuration,
            pot.cycleCount,
            pot.completedCycles,
            pot.frequency,
            pot.bidDepositDeadline,
            pot.status,
            pot.members,
            pot.cycleIds,
            pot.totalYieldGenerated,
            pot.autoYieldDistribution
        );
    }

    function getUserBid(
        uint256 cycleId,
        address user
    ) external view validCycle(cycleId) returns (uint256) {
        return auctionCycles[cycleId].bids[user];
    }

    function getCycleParticipants(
        uint256 cycleId
    ) external view validCycle(cycleId) returns (address[] memory) {
        AuctionCycle storage cycle = auctionCycles[cycleId];
        address[] memory participants = new address[](
            cycle.participants.length()
        );

        for (uint256 i = 0; i < cycle.participants.length(); i++) {
            participants[i] = cycle.participants.at(i);
        }

        return participants;
    }

    function getUserPots(
        address user
    ) external view returns (uint256[] memory) {
        return userPots[user];
    }

    function getPotMemberCount(
        uint256 potId
    ) external view validPot(potId) returns (uint256) {
        return chainPots[potId].members.length;
    }

    function isPotMember(
        uint256 potId,
        address user
    ) external view returns (bool) {
        return hasJoinedPot[potId][user];
    }

    function getCurrentPotCount() external view returns (uint256) {
        return potCounter - 1;
    }

    function getCurrentCycleCount() external view returns (uint256) {
        return cycleCounter - 1;
    }

    function getPotYieldStats(
        uint256 potId
    )
        external
        view
        validPot(potId)
        returns (
            uint256 totalYieldGenerated,
            uint256 minimumThreshold,
            bool reinvestmentEnabled,
            bool autoDistribution
        )
    {
        Pot storage pot = chainPots[potId];
        return (
            pot.totalYieldGenerated,
            potMinimumYieldThreshold[potId],
            potYieldReinvestment[potId],
            pot.autoYieldDistribution
        );
    }

    function estimatePotYield(
        uint256 potId,
        uint256 cycleDuration
    ) external view validPot(potId) returns (uint256 estimatedYield) {
        Pot storage pot = chainPots[potId];
        uint256 totalContribution = pot.amountPerCycle * pot.members.length;

        // Get current APY from escrow/yield manager
        uint256 currentAPY = escrow.getCurrentYieldRate();
        uint256 annualYield = (totalContribution * currentAPY) / 10000;
        estimatedYield = (annualYield * cycleDuration) / 365 days;

        return estimatedYield;
    }

    // ==================== Emergency Functions ====================

    function emergencyPausePot(
        uint256 potId,
        string memory reason
    ) external onlyOwner validPot(potId) {
        require(bytes(reason).length > 0, "Must provide reason");
        chainPots[potId].status = PotStatus.Paused;
        emit PotStatusChanged(potId, PotStatus.Paused);
        emit EmergencyAction(potId, "EMERGENCY_PAUSE", reason);
    }

    function emergencyCompleteCycle(
        uint256 cycleId,
        string memory reason
    ) external onlyOwner validCycle(cycleId) {
        require(bytes(reason).length > 0, "Must provide reason");
        AuctionCycle storage cycle = auctionCycles[cycleId];

        if (cycle.status != CycleStatus.Completed) {
            cycle.status = CycleStatus.Completed;
            escrow.completeCycle(cycleId);
            chainPots[cycle.potId].completedCycles++;
        }

        emit EmergencyAction(cycle.potId, "EMERGENCY_COMPLETE_CYCLE", reason);
    }

    function emergencyWithdraw(
        uint256 amount,
        address to,
        string memory reason
    ) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(to != address(0), "Invalid recipient");
        require(bytes(reason).length > 0, "Must provide reason");
        require(address(this).balance >= amount, "Insufficient balance");

        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "Emergency withdrawal failed");

        emit EmergencyAction(0, "EMERGENCY_WITHDRAW", reason);
    }

    function globalPause() external onlyOwner {
        _pause();
    }

    function globalUnpause() external onlyOwner {
        _unpause();
    }

    // ==================== Contract Management ====================

    function updateMemberManager(address _memberManager) external onlyOwner {
        require(_memberManager != address(0), "Invalid address");
        memberManager = MemberAccountManager(_memberManager);
    }

    function updateLotteryEngine(address payable _lotteryEngine) external onlyOwner {
        require(_lotteryEngine != address(0), "Invalid address");
        lotteryEngine = CitreaLotteryEngine(_lotteryEngine);
    }

    function updateEscrow(address payable _escrow) external onlyOwner {
        require(_escrow != address(0), "Invalid address");
        escrow = CitreaEscrow(_escrow);
    }

    // ==================== Receive Functions ====================

    receive() external payable {
        // Allow contract to receive BTC for bid payments
    }

    fallback() external payable {
        revert("Function not found");
    }
}
