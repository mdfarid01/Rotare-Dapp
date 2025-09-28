import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Gavel, TrendingUp, Clock, Users, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useToast } from '@/hooks/use-toast';

const activeAuctions = [
  {
    id: 1,
    potName: 'High Yield Pool',
    currentBid: '0.85',
    minBid: '0.75',
    timeLeft: '2h 15m',
    participants: 8,
    totalPot: '12.5 cBTC',
    progress: 68,
  },
  {
    id: 2,
    potName: 'Stable Growth',
    currentBid: '1.20',
    minBid: '1.00',
    timeLeft: '45m',
    participants: 12,
    totalPot: '18.3 cBTC',
    progress: 85,
  },
  {
    id: 3,
    potName: 'Quick Return',
    currentBid: '0.45',
    minBid: '0.40',
    timeLeft: '3h 30m',
    participants: 5,
    totalPot: '6.8 cBTC',
    progress: 42,
  },
];

const auctionStats = [
  {
    title: 'Active Auctions',
    value: '3',
    change: '+1 today',
    icon: Gavel,
    color: 'from-primary to-primary-glow',
  },
  {
    title: 'Total Volume',
    value: '37.6 cBTC',
    change: '+8.2% this week',
    icon: TrendingUp,
    color: 'from-secondary to-accent',
  },
  {
    title: 'Your Bids',
    value: '2',
    change: '1 winning',
    icon: Target,
    color: 'from-success to-primary',
  },
];

export const Bid: React.FC = () => {
  const { isConnected } = useAccount();
  const { toast } = useToast();
  const [selectedAuction, setSelectedAuction] = useState<string>('');
  const [bidAmount, setBidAmount] = useState<string>('');

  const handlePlaceBid = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to place a bid",
        variant: "destructive",
      });
      return;
    }

    if (!selectedAuction || !bidAmount) {
      toast({
        title: "Missing Information",
        description: "Please select an auction and enter bid amount",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Placing Bid",
        description: "Please confirm the transaction in MetaMask",
      });
      
      // Simulate transaction
      setTimeout(() => {
        toast({
          title: "Bid Placed Successfully",
          description: `Your bid of ${bidAmount} cBTC has been placed`,
        });
        setBidAmount('');
        setSelectedAuction('');
      }, 3000);
    } catch (error) {
      toast({
        title: "Bid Failed",
        description: "Transaction was rejected or failed",
        variant: "destructive",
      });
    }
  };

  const selectedAuctionData = activeAuctions.find(a => a.id.toString() === selectedAuction);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Dutch Auctions</h1>
            <p className="text-muted-foreground">Participate in ROSCA pot auctions for early access</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {auctionStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card hover-lift group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-2">{stat.change}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bid Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gavel className="w-5 h-5 mr-2" />
                  Place Bid
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Auction Selection */}
                <div className="space-y-2">
                  <Label>Select Auction</Label>
                  <Select onValueChange={setSelectedAuction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an active auction" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeAuctions.map((auction) => (
                        <SelectItem key={auction.id} value={auction.id.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{auction.potName}</span>
                              <Badge variant="outline" className="border-success text-success">
                                {auction.timeLeft} left
                              </Badge>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Bid Amount */}
                <div className="space-y-2">
                  <Label htmlFor="bidAmount">Bid Amount (cBTC)</Label>
                  <div className="relative">
                    <Input
                      id="bidAmount"
                      type="number"
                      step="0.001"
                      placeholder="0.0"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="pr-20"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-sm text-muted-foreground">cBTC</span>
                    </div>
                  </div>
                  {selectedAuctionData && (
                    <p className="text-sm text-muted-foreground">
                      Minimum bid: {selectedAuctionData.minBid} cBTC
                    </p>
                  )}
                </div>

                {/* Auction Details */}
                {selectedAuctionData && (
                  <div className="glass-card p-4 space-y-3">
                    <h4 className="font-medium">Auction Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Highest Bid:</span>
                        <span className="font-medium gradient-text">{selectedAuctionData.currentBid} cBTC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Pot Value:</span>
                        <span className="font-medium">{selectedAuctionData.totalPot}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Participants:</span>
                        <span className="font-medium">{selectedAuctionData.participants}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time Remaining:</span>
                        <span className="font-medium text-warning">{selectedAuctionData.timeLeft}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Auction Progress</span>
                        <span>{selectedAuctionData.progress}%</span>
                      </div>
                      <Progress value={selectedAuctionData.progress} className="h-2" />
                    </div>
                  </div>
                )}

                {/* Place Bid Button */}
                <Button 
                  onClick={handlePlaceBid}
                  disabled={!selectedAuction || !bidAmount || !isConnected}
                  className="w-full hover-glow"
                  size="lg"
                >
                  Place Bid {bidAmount && `- ${bidAmount} cBTC`}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Auctions List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Active Auctions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeAuctions.map((auction, index) => (
                  <motion.div
                    key={auction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card p-4 hover-lift cursor-pointer"
                    onClick={() => setSelectedAuction(auction.id.toString())}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{auction.potName}</h4>
                        <Badge variant={auction.progress > 80 ? "destructive" : "default"}>
                          {auction.timeLeft}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Current Bid</p>
                          <p className="font-semibold gradient-text">{auction.currentBid} cBTC</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Pot</p>
                          <p className="font-semibold">{auction.totalPot}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {auction.participants} participants
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {auction.progress}% complete
                        </div>
                      </div>
                      
                      <Progress value={auction.progress} className="h-1" />
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};