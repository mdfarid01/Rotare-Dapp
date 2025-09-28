import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Wallet, TrendingUp, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useTransactionModal } from '@/hooks/useTransactionModal';
import { TransactionModal } from '@/components/ui/transaction-modal';

const assets = [
  { symbol: 'cBTC', name: 'Citrea Bitcoin', balance: '2.45', apy: '8.2%' },
  { symbol: 'ETH', name: 'Ethereum', balance: '15.2', apy: '6.5%' },
  { symbol: 'USDC', name: 'USD Coin', balance: '5,240', apy: '4.1%' },
];

const features = [
  {
    icon: Shield,
    title: 'Secure Storage',
    description: 'Your funds are protected by smart contracts',
  },
  {
    icon: TrendingUp,
    title: 'Earn Yield',
    description: 'Generate returns while your funds are locked',
  },
  {
    icon: Zap,
    title: 'Instant Access',
    description: 'Participate in Dutch auctions for early access',
  },
];

export const Deposit: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [selectedPot, setSelectedPot] = useState<string>('');
  
  const { modalState, simulateTransaction, closeModal, retryTransaction } = useTransactionModal();

  const handleDeposit = async () => {
    if (!selectedAsset || !amount || !selectedPot) return;
    
    const asset = assets.find(a => a.symbol === selectedAsset);
    await simulateTransaction(
      'Deposit to ROSCA Pot',
      amount,
      asset?.symbol || 'cBTC',
      `Depositing ${amount} ${asset?.symbol} to ${selectedPot}...`
    );
  };

  const selectedAssetData = assets.find(a => a.symbol === selectedAsset);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Deposit Funds</h1>
            <p className="text-muted-foreground">Add funds to your ROSCA pots and start earning yield</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Deposit Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet className="w-5 h-5 mr-2" />
                  Deposit Form
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Asset Selection */}
                <div className="space-y-2">
                  <Label>Select Asset</Label>
                  <Select onValueChange={setSelectedAsset}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an asset to deposit" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map((asset) => (
                        <SelectItem key={asset.symbol} value={asset.symbol}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{asset.symbol}</span>
                              <span className="text-muted-foreground">{asset.name}</span>
                            </div>
                            <Badge variant="outline" className="border-success text-success ml-2">
                              {asset.apy} APY
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedAssetData && (
                    <p className="text-sm text-muted-foreground">
                      Balance: {selectedAssetData.balance} {selectedAssetData.symbol}
                    </p>
                  )}
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      step="0.001"
                      placeholder="0.0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pr-20"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-sm text-muted-foreground">{selectedAsset}</span>
                    </div>
                  </div>
                  {selectedAssetData && amount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Max:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-primary"
                        onClick={() => setAmount(selectedAssetData.balance)}
                      >
                        {selectedAssetData.balance} {selectedAssetData.symbol}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Pot Selection */}
                <div className="space-y-2">
                  <Label>Target Pot</Label>
                  <Select onValueChange={setSelectedPot}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a ROSCA pot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high-yield">High Yield Savings Pool</SelectItem>
                      <SelectItem value="stable-growth">Stable Growth Pool</SelectItem>
                      <SelectItem value="quick-return">Quick Return Fund</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Summary */}
                {selectedAssetData && amount && selectedPot && (
                  <div className="glass-card p-4 space-y-2">
                    <h4 className="font-medium">Transaction Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Depositing:</span>
                        <span className="font-medium gradient-text">{amount} {selectedAssetData.symbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expected APY:</span>
                        <span className="font-medium text-success">{selectedAssetData.apy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Target Pot:</span>
                        <span className="font-medium capitalize">{selectedPot.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Deposit Button */}
                <Button 
                  onClick={handleDeposit}
                  disabled={!selectedAsset || !amount || !selectedPot}
                  className="w-full hover-glow"
                  size="lg"
                >
                  Deposit {amount} {selectedAsset}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features & Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Features */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Why Deposit with Rotare?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Assets Overview */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Available Assets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {assets.map((asset, index) => (
                  <motion.div
                    key={asset.symbol}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{asset.symbol}</p>
                      <p className="text-sm text-muted-foreground">{asset.name}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="border-success text-success">
                        {asset.apy} APY
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        Balance: {asset.balance}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        status={modalState.status}
        title={modalState.title}
        description={modalState.description}
        txHash={modalState.txHash}
        amount={modalState.amount}
        asset={modalState.asset}
        onRetry={retryTransaction}
      />
    </div>
  );
};