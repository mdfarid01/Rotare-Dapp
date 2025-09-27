// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./CitreaNativeYeildManager.sol";

/// @title CitreaEscrow
/// @notice Enhanced escrow contract for ChainPot using native BTC yield generation on Citrea
/// @dev Manages fund deposits, withdrawals, and yield distribution using BTC staking
contract CitreaEscrow is Ownable, ReentrancyGuard, Pausable {
    
    // ==================== State Variables ====================
    
    CitreaNativeYieldManager public immutable yieldManager;
    address public auctionEngine;
    
    struct DepositInfo {
        uint256 amount;
        uint256 potId;
        uint256 cycleId;
        address depositor;
        uint256 timestamp;
        uint256 yieldStakeIndex; // Index in yield manager
        bool isActive;
        bool hasYieldStake;
    }
    
    struct CycleSummary {
        uint256 totalDeposited;
        uint256 totalYieldGenerated;
        uint256 participantCount;
        bool isCompleted;
        mapping(address => uint256) memberDeposits;
        address[] participants;
    }
    
    // Core mappings
    uint256 public depositCounter = 1;
    mapping(uint256 => DepositInfo) public deposits;
    mapping(uint256 => uint256[]) public cycleDeposits; // cycleId => deposit IDs
    mapping(address => uint256[]) public userDeposits; // user => deposit IDs
    mapping(uint256 => uint256) public potBalances; // potId => total balance
    mapping(uint256 => CycleSummary) private cycleSummaries; // cycleId => summary
    
    // Yield tracking
    mapping(uint256 => uint256) public potYieldAccrued; // potId => total yield
    mapping(address => uint256) public userYieldEarned; // user => total yield earned
    
    // Security features
    uint256 public constant MIN_DEPOSIT = 0.001 ether; // Minimum BTC deposit
    uint256 public constant MAX_CYCLE_DURATION = 90 days;
    
    // Fee structure
    uint256 public platformFeeRate = 100; // 1% platform fee
    uint256 public yieldDistributionRate = 7000; // 70% yield to members, 30% to protocol
    
    // ==================== Events ====================
    
    event FundsDeposited(
        uint256 indexed depositId,
        uint256 indexed potId,
        uint256 indexed cycleId,
        address depositor,
        uint256 amount,
        uint256 yieldStakeIndex
    );
    event FundsWithdrawn(address indexed recipient, uint256 amount, uint256 yield);
    event WinnerPaid(uint256 indexed cycleId, address indexed winner, uint256 amount, uint256 yield);
    event YieldDistributed(uint256 indexed cycleId, uint256 totalYield, uint256 participantCount);
    event CycleCompleted(uint256 indexed cycleId, uint256 totalAmount, uint256 totalYield);
    event AuctionEngineUpdated(address indexed oldEngine, address indexed newEngine);
    event PlatformFeeRateUpdated(uint256 oldRate, uint256 newRate);
    event YieldDistributionRateUpdated(uint256 oldRate, uint256 newRate);
    event EmergencyWithdrawal(address indexed user, uint256 amount, string reason);
    
    // ==================== Constructor ====================
    
constructor(address payable _yieldManager) Ownable(msg.sender) {
    require(_yieldManager != address(0), "Invalid yield manager address");
    yieldManager = CitreaNativeYieldManager(_yieldManager);
}
    
    // ==================== Modifiers ====================
    
    modifier onlyAuctionEngine() {
        require(msg.sender == auctionEngine, "Only AuctionEngine allowed");
        _;
    }
    
    modifier validDepositId(uint256 depositId) {
        require(depositId > 0 && depositId < depositCounter, "Invalid deposit ID");
        require(deposits[depositId].depositor != address(0), "Deposit does not exist");
        _;
    }
    
    // ==================== Admin Functions ====================
    
    function setAuctionEngine(address _auctionEngine) external onlyOwner {
        require(_auctionEngine != address(0), "Invalid auction engine address");
        
        address oldEngine = auctionEngine;
        auctionEngine = _auctionEngine;
        
        emit AuctionEngineUpdated(oldEngine, _auctionEngine);
    }
    
    function updatePlatformFeeRate(uint256 newRate) external onlyOwner {
        require(newRate <= 500, "Fee rate too high"); // Max 5%
        
        uint256 oldRate = platformFeeRate;
        platformFeeRate = newRate;
        
        emit PlatformFeeRateUpdated(oldRate, newRate);
    }
    
    function updateYieldDistributionRate(uint256 newRate) external onlyOwner {
        require(newRate >= 5000 && newRate <= 9000, "Invalid distribution rate"); // 50-90%
        
        uint256 oldRate = yieldDistributionRate;
        yieldDistributionRate = newRate;
        
        emit YieldDistributionRateUpdated(oldRate, newRate);
    }
    
    // ==================== Core Deposit Functions ====================
    
    /// @notice Deposit funds for a specific pot and cycle
    /// @param potId The pot ID
    /// @param cycleId The cycle ID
    /// @param member The member making the deposit
    function deposit(
        uint256 potId, 
        uint256 cycleId, 
        address member
    ) external payable onlyAuctionEngine whenNotPaused nonReentrant {
        require(msg.value >= MIN_DEPOSIT, "Deposit amount too low");
        require(member != address(0), "Invalid member address");
        require(potId > 0, "Invalid pot ID");
        require(cycleId > 0, "Invalid cycle ID");
        
        // Stake in yield manager to earn BTC yield
        yieldManager.stakeBtcForUser{value: msg.value}(member, potId);
        
        // Get the stake index (will be the latest one)
        uint256 stakeCount = yieldManager.getUserStakeCount(member);
        uint256 yieldStakeIndex = stakeCount > 0 ? stakeCount - 1 : 0;
        
        // Create deposit record
        uint256 depositId = depositCounter++;
        deposits[depositId] = DepositInfo({
            amount: msg.value,
            potId: potId,
            cycleId: cycleId,
            depositor: member,
            timestamp: block.timestamp,
            yieldStakeIndex: yieldStakeIndex,
            isActive: true,
            hasYieldStake: true
        });
        
        // Update mappings
        cycleDeposits[cycleId].push(depositId);
        userDeposits[member].push(depositId);
        potBalances[potId] += msg.value;
        
        // Update cycle summary
        CycleSummary storage summary = cycleSummaries[cycleId];
        if (summary.memberDeposits[member] == 0) {
            summary.participants.push(member);
            summary.participantCount++;
        }
        summary.memberDeposits[member] += msg.value;
        summary.totalDeposited += msg.value;
        
        emit FundsDeposited(depositId, potId, cycleId, member, msg.value, yieldStakeIndex);
    }
    
    /// @notice Batch deposit for multiple members (gas optimization)
    function batchDeposit(
        uint256 potId,
        uint256 cycleId,
        address[] calldata members,
        uint256[] calldata amounts
    ) external payable onlyAuctionEngine whenNotPaused nonReentrant {
        require(members.length == amounts.length && members.length > 0, "Invalid input arrays");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            require(amounts[i] >= MIN_DEPOSIT, "Deposit too low");
            totalAmount += amounts[i];
        }
        require(msg.value == totalAmount, "Incorrect total payment");
        
        CycleSummary storage summary = cycleSummaries[cycleId];
        
        for (uint256 i = 0; i < members.length; i++) {
            address member = members[i];
            uint256 amount = amounts[i];
            
            require(member != address(0), "Invalid member address");
            
            // Stake each member's amount
            yieldManager.stakeBtcForUser{value: amount}(member, potId);
            uint256 stakeCount = yieldManager.getUserStakeCount(member);
            uint256 yieldStakeIndex = stakeCount > 0 ? stakeCount - 1 : 0;
            
            // Create deposit record
            uint256 depositId = depositCounter++;
            deposits[depositId] = DepositInfo({
                amount: amount,
                potId: potId,
                cycleId: cycleId,
                depositor: member,
                timestamp: block.timestamp,
                yieldStakeIndex: yieldStakeIndex,
                isActive: true,
                hasYieldStake: true
            });
            
            // Update mappings
            cycleDeposits[cycleId].push(depositId);
            userDeposits[member].push(depositId);
            potBalances[potId] += amount;
            
            // Update cycle summary
            if (summary.memberDeposits[member] == 0) {
                summary.participants.push(member);
                summary.participantCount++;
            }
            summary.memberDeposits[member] += amount;
            summary.totalDeposited += amount;
            
            emit FundsDeposited(depositId, potId, cycleId, member, amount, yieldStakeIndex);
        }
    }
    
    // ==================== Withdrawal Functions ====================
    
    /// @notice Withdraw funds to specified address
    function withdrawFunds(uint256 amount, address to) 
        external 
        onlyAuctionEngine 
        whenNotPaused 
        nonReentrant 
    {
        require(amount > 0, "Amount must be > 0");
        require(to != address(0), "Invalid recipient");
        
        // For simplicity, transfer from contract balance
        // In production, might need to unstake from yield manager
        require(address(this).balance >= amount, "Insufficient balance");
        
        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit FundsWithdrawn(to, amount, 0);
    }
    
    /// @notice Release funds to cycle winner with yield
    function releaseFundsToWinner(
        uint256 amount,
        address payable winner,
        uint256 cycleId
    ) external onlyAuctionEngine whenNotPaused nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(winner != address(0), "Invalid winner address");
        require(cycleId > 0, "Invalid cycle ID");
        
        // Get cycle deposits to calculate yield distribution
        uint256[] memory depositIds = cycleDeposits[cycleId];
        require(depositIds.length > 0, "No deposits for cycle");
        
        uint256 totalYieldGenerated = 0;
        uint256 winnerYield = 0;
        
        // Calculate total yield from all deposits in this cycle
        for (uint256 i = 0; i < depositIds.length; i++) {
            DepositInfo storage depositInfo = deposits[depositIds[i]];
            if (depositInfo.hasYieldStake && depositInfo.isActive) {
                uint256 currentYield = yieldManager.getUserCurrentYield(
                    depositInfo.depositor,
                    depositInfo.yieldStakeIndex
                );
                
                totalYieldGenerated += currentYield;
                
                // If this deposit belongs to the winner, track their yield
                if (depositInfo.depositor == winner) {
                    winnerYield += currentYield;
                }
            }
        }
        
        // Calculate platform fee
        uint256 platformFee = (amount * platformFeeRate) / 10000;
        uint256 netAmount = amount - platformFee;
        
        // Transfer funds to winner
        (bool success, ) = winner.call{value: netAmount + winnerYield}("");
        require(success, "Transfer to winner failed");
        
        // Track yield distribution
        potYieldAccrued[cycleSummaries[cycleId].totalDeposited > 0 ? cycleId : 0] += totalYieldGenerated;
        userYieldEarned[winner] += winnerYield;
        
        emit WinnerPaid(cycleId, winner, netAmount, winnerYield);
    }
    
    /// @notice Distribute interest/yield to cycle contributors
    function distributeYieldToContributors(
        uint256 cycleId,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyAuctionEngine whenNotPaused nonReentrant {
        require(recipients.length == amounts.length && recipients.length > 0, "Invalid arrays");
        
        uint256 totalDistribution = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient");
            require(amounts[i] > 0, "Invalid amount");
            totalDistribution += amounts[i];
        }
        
        require(address(this).balance >= totalDistribution, "Insufficient balance");
        
        // Distribute to each recipient
        for (uint256 i = 0; i < recipients.length; i++) {
            (bool success, ) = payable(recipients[i]).call{value: amounts[i]}("");
            require(success, "Transfer failed");
            
            userYieldEarned[recipients[i]] += amounts[i];
        }
        
        cycleSummaries[cycleId].totalYieldGenerated += totalDistribution;
        
        emit YieldDistributed(cycleId, totalDistribution, recipients.length);
    }
    
    /// @notice Complete a cycle and finalize yield distribution
    function completeCycle(uint256 cycleId) 
        external 
        onlyAuctionEngine 
        whenNotPaused 
        nonReentrant 
    {
        require(cycleId > 0, "Invalid cycle ID");
        CycleSummary storage summary = cycleSummaries[cycleId];
        require(!summary.isCompleted, "Cycle already completed");
        
        // Mark cycle as completed
        summary.isCompleted = true;
        
        // Calculate total yield generated for this cycle
        uint256[] memory depositIds = cycleDeposits[cycleId];
        uint256 totalCycleYield = 0;
        
        for (uint256 i = 0; i < depositIds.length; i++) {
            DepositInfo storage depositInfo = deposits[depositIds[i]];
            if (depositInfo.hasYieldStake && depositInfo.isActive) {
                uint256 currentYield = yieldManager.getUserCurrentYield(
                    depositInfo.depositor,
                    depositInfo.yieldStakeIndex
                );
                totalCycleYield += currentYield;
                
                // Mark deposit as inactive (cycle completed)
                depositInfo.isActive = false;
            }
        }
        
        summary.totalYieldGenerated += totalCycleYield;
        
        emit CycleCompleted(cycleId, summary.totalDeposited, summary.totalYieldGenerated);
    }
    
    /// @notice Unstake funds for completed cycles or emergency situations
    function unstakeFundsForUser(address user, uint256 stakeIndex, address recipient) 
        external 
        onlyAuctionEngine 
        whenNotPaused 
        nonReentrant 
    {
        require(user != address(0), "Invalid user");
        require(recipient != address(0), "Invalid recipient");
        
        // This will handle the unstaking and transfer
        yieldManager.unstakeBtcForUser(user, stakeIndex, recipient);
    }
    
    // ==================== View Functions ====================
    
    function getEscrowBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    function getTotalStakedInYieldManager() external view returns (uint256) {
        (uint256 totalStaked, , , ) = yieldManager.getGlobalYieldPool();
        return totalStaked;
    }
    
    function getDepositsForCycle(uint256 cycleId) external view returns (uint256[] memory) {
        return cycleDeposits[cycleId];
    }
    
    function getDepositsForUser(address user) external view returns (uint256[] memory) {
        return userDeposits[user];
    }
    
    function getDepositInfo(uint256 depositId) 
        external 
        view 
        validDepositId(depositId) 
        returns (DepositInfo memory) 
    {
        return deposits[depositId];
    }
    
    function getPotBalance(uint256 potId) external view returns (uint256) {
        return potBalances[potId];
    }
    
    function getCycleSummary(uint256 cycleId) 
        external 
        view 
        returns (
            uint256 totalDeposited,
            uint256 totalYieldGenerated,
            uint256 participantCount,
            bool isCompleted,
            address[] memory participants
        ) 
    {
        CycleSummary storage summary = cycleSummaries[cycleId];
        return (
            summary.totalDeposited,
            summary.totalYieldGenerated,
            summary.participantCount,
            summary.isCompleted,
            summary.participants
        );
    }
    
    function getCycleMemberDeposit(uint256 cycleId, address member) 
        external 
        view 
        returns (uint256) 
    {
        return cycleSummaries[cycleId].memberDeposits[member];
    }
    
    function getUserTotalYieldEarned(address user) external view returns (uint256) {
        return userYieldEarned[user];
    }
    
    function getPotTotalYield(uint256 potId) external view returns (uint256) {
        return potYieldAccrued[potId];
    }
    
    function getCurrentDepositId() external view returns (uint256) {
        return depositCounter - 1;
    }
    
    function isDepositActive(uint256 depositId) 
        external 
        view 
        validDepositId(depositId) 
        returns (bool) 
    {
        return deposits[depositId].isActive;
    }
    
    function getDepositYield(uint256 depositId) 
        external 
        view 
        validDepositId(depositId) 
        returns (uint256) 
    {
        DepositInfo memory deposit = deposits[depositId];
        if (!deposit.hasYieldStake || !deposit.isActive) {
            return 0;
        }
        
        return yieldManager.getUserCurrentYield(deposit.depositor, deposit.yieldStakeIndex);
    }
    
    // ==================== Emergency Functions ====================
    
    function emergencyWithdraw(uint256 amount, address to, string memory reason) 
        external 
        onlyOwner 
        nonReentrant 
    {
        require(amount > 0, "Amount must be > 0");
        require(to != address(0), "Invalid recipient");
        require(bytes(reason).length > 0, "Must provide reason");
        require(address(this).balance >= amount, "Insufficient balance");
        
        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "Emergency withdrawal failed");
        
        emit EmergencyWithdrawal(to, amount, reason);
    }
    
    function emergencyPause() external onlyOwner {
        _pause();
    }
    
    function emergencyUnpause() external onlyOwner {
        _unpause();
    }
    
    function deactivateDeposit(uint256 depositId) 
        external 
        onlyAuctionEngine 
        validDepositId(depositId) 
    {
        deposits[depositId].isActive = false;
    }
    
    // ==================== Fee Management ====================
    
    function collectPlatformFees(address recipient, uint256 amount) 
        external 
        onlyOwner 
        nonReentrant 
    {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0 && amount <= address(this).balance, "Invalid amount");
        
        (bool success, ) = payable(recipient).call{value: amount}("");
        require(success, "Fee collection failed");
    }
    
    // ==================== Yield Manager Integration ====================
    
    function getYieldManagerAddress() external view returns (address) {
        return address(yieldManager);
    }
    
    function getCurrentYieldRate() external view returns (uint256) {
        return yieldManager.getCurrentAPY();
    }
    
    function estimateCycleYield(uint256 cycleId, uint256 duration) 
        external 
        view 
        returns (uint256 estimatedYield) 
    {
        CycleSummary storage summary = cycleSummaries[cycleId];
        if (summary.totalDeposited == 0) return 0;
        
        uint256 currentAPY = yieldManager.getCurrentAPY();
        uint256 annualYield = (summary.totalDeposited * currentAPY) / 10000;
        estimatedYield = (annualYield * duration) / 365 days;
        
        return estimatedYield;
    }
    
    // ==================== Receive Function ====================
    
    receive() external payable {
        // Allow contract to receive BTC
        // This could come from yield manager withdrawals or direct transfers
    }
    
    fallback() external payable {
        revert("Function not found");
    }
}