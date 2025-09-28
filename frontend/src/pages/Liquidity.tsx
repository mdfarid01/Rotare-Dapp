import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Droplets, BarChart3, Plus, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTransactionModal } from '@/hooks/useTransactionModal';
import { TransactionModal } from '@/components/ui/transaction-modal';

const liquidityStats = [
  {
    title: 'Total TVL',
    value: '$2,140,000',
    change: '+12.3%',
    icon: TrendingUp,
    color: 'from-primary to-primary-glow',
  },
  {
    title: '24h Net Flows',
    value: '+$84,200',
    change: '+8.7%',
    icon: Droplets,
    color: 'from-secondary to-accent',
  },
  {
    title: 'Average APY',
    value: '8.2%',
    change: '+1.4%',
    icon: BarChart3,
    color: 'from-success to-primary',
  },
];

const liquidityPools = [
  {
    id: 1,
    name: 'ETH Yield Pot',
    tvl: '$1,250,000',
    utilization: 72,
    apy: '8.2%',
    status: 'active',
  },
  {
    id: 2,
    name: 'Stable Vault',
    tvl: '$860,000',
    utilization: 41,
    apy: '5.1%',
    status: 'active',
  },
  {
    id: 3,
    name: 'Alt Auction Pool',
    tvl: '$430,000',
    utilization: 58,
    apy: '11.4%',
    status: 'active',
  },
];

export const Liquidity: React.FC = () => {
  const { modalState, simulateTransaction, closeModal, retryTransaction } = useTransactionModal();

  const handleAddLiquidity = async (poolName: string, amount: string) => {
    await simulateTransaction(
      'Add Liquidity',
      amount,
      'cBTC',
      `Adding liquidity to ${poolName}...`
    );
  };

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold"
          >
            Liquidity Pools
          </motion.h1>
          <p className="text-muted-foreground mt-1">
            Provide liquidity and earn yield from ROSCA pool activities
          </p>
        </div>
        
        <Button 
          onClick={() => handleAddLiquidity('Selected Pool', '1.0')}
          className="hover-glow"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Liquidity
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {liquidityStats.map((stat, index) => (
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
                    <Badge variant="outline" className="border-success text-success mt-2">
                      {stat.change}
                    </Badge>
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

      {/* Liquidity Pools Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Droplets className="w-5 h-5 mr-2" />
            Active Liquidity Pools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {liquidityPools.map((pool, index) => (
              <motion.div
                key={pool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 hover-lift group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-lg">{pool.name}</h3>
                      <Badge variant="outline" className="border-success text-success">
                        {pool.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">TVL</p>
                        <p className="font-semibold gradient-text">{pool.tvl}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">APY</p>
                        <p className="font-semibold text-success">{pool.apy}</p>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <p className="text-xs text-muted-foreground">Utilization</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Progress value={pool.utilization} className="flex-1 h-2" />
                          <span className="text-sm font-medium">{pool.utilization}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAddLiquidity(pool.name, '0.5')}
                    >
                      Add Liquidity
                    </Button>
                    <Button size="sm" variant="ghost">
                      Details
                      <ArrowUpRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

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