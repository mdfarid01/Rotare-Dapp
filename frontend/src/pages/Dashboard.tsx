import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity, 
  Plus, 
  Search,
  Filter,
  ArrowUpRight,
  Wallet,
  PieChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { useTransactionModal } from '@/hooks/useTransactionModal';
import { TransactionModal } from '@/components/ui/transaction-modal';

const stats = [
  {
    title: 'Total Value Locked',
    value: '2.45 cBTC',
    change: '+12.3%',
    icon: DollarSign,
    color: 'from-primary to-primary-glow',
  },
  {
    title: 'Active Pots',
    value: '3',
    change: '+1',
    icon: Activity,
    color: 'from-secondary to-accent',
  },
  {
    title: 'Total Members',
    value: '127',
    change: '+23',
    icon: Users,
    color: 'from-accent to-secondary',
  },
  {
    title: 'Yield Earned',
    value: '0.245 cBTC',
    change: '+8.7%',
    icon: TrendingUp,
    color: 'from-success to-primary',
  },
];

const myPots = [
  {
    id: 1,
    name: 'High Yield Savings',
    apy: '12.5%',
    tvl: '1.2 cBTC',
    members: 8,
    maxMembers: 10,
    status: 'active',
    nextPayout: '2 days',
    progress: 80,
  },
  {
    id: 2,
    name: 'Stable Growth Pool',
    apy: '8.2%',
    tvl: '0.8 cBTC',
    members: 5,
    maxMembers: 8,
    status: 'filling',
    nextPayout: '5 days',
    progress: 62,
  },
  {
    id: 3,
    name: 'Quick Return Fund',
    apy: '15.1%',
    tvl: '0.45 cBTC',
    members: 3,
    maxMembers: 6,
    status: 'new',
    nextPayout: '1 week',
    progress: 50,
  },
];

const recentActivity = [
  {
    id: 1,
    type: 'deposit',
    amount: '0.1 cBTC',
    pot: 'High Yield Savings',
    time: '2 hours ago',
    status: 'completed',
  },
  {
    id: 2,
    type: 'bid_won',
    amount: '0.5 cBTC',
    pot: 'Stable Growth Pool',
    time: '1 day ago',
    status: 'completed',
  },
  {
    id: 3,
    type: 'yield_earned',
    amount: '0.025 cBTC',
    pot: 'High Yield Savings',
    time: '2 days ago',
    status: 'completed',
  },
];

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const { modalState, simulateTransaction, closeModal, retryTransaction } = useTransactionModal();

  const handleQuickAction = async (action: string, amount: string, asset: string) => {
    await simulateTransaction(
      `${action} Transaction`,
      amount,
      asset,
      `Processing your ${action.toLowerCase()} transaction...`
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
            Welcome back! 👋
          </motion.h1>
          <p className="text-muted-foreground mt-1">
            Manage your ROSCA pools and track your yield earnings
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => handleQuickAction('Deposit', '0.1', 'cBTC')}
            className="hover-lift"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Quick Deposit
          </Button>
          <Button asChild className="hover-glow">
            <Link to="/create-pot">
              <Plus className="w-4 h-4 mr-2" />
              Create Pot
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
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

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-fit lg:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="my-pots">My Pots</TabsTrigger>
          <TabsTrigger value="all-pots">All Pots</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <Card className="glass-card lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="w-5 h-5 mr-2" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 rounded-full bg-success"></div>
                          <div>
                            <p className="font-medium capitalize">{activity.type.replace('_', ' ')}</p>
                            <p className="text-sm text-muted-foreground">{activity.pot}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium gradient-text">{activity.amount}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Portfolio Performance */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PieChart className="w-5 h-5 mr-2" />
                      Portfolio
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>High Yield Savings</span>
                        <span className="font-medium">65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Stable Growth Pool</span>
                        <span className="font-medium">25%</span>
                      </div>
                      <Progress value={25} className="h-2" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Quick Return Fund</span>
                        <span className="font-medium">10%</span>
                      </div>
                      <Progress value={10} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="my-pots" className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <h2 className="text-2xl font-semibold">My ROSCA Pots</h2>
                <div className="flex space-x-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search pots..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myPots.map((pot, index) => (
                  <motion.div
                    key={pot.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass-card hover-lift group h-full">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{pot.name}</h3>
                          <Badge 
                            variant="outline" 
                            className={
                              pot.status === 'active' ? 'border-success text-success' :
                              pot.status === 'filling' ? 'border-warning text-warning' :
                              'border-primary text-primary'
                            }
                          >
                            {pot.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">APY</span>
                            <span className="font-medium gradient-text">{pot.apy}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">TVL</span>
                            <span className="font-medium">{pot.tvl}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Members</span>
                            <span className="font-medium">{pot.members}/{pot.maxMembers}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{pot.progress}%</span>
                          </div>
                          <Progress value={pot.progress} className="h-2" />
                        </div>

                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleQuickAction('Deposit', '0.05', 'cBTC')}
                          >
                            Deposit
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            Details
                            <ArrowUpRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="all-pots" className="space-y-6">
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">All Pots Coming Soon</h3>
                <p className="text-muted-foreground">Browse and join pots created by the community</p>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground">Detailed yield analytics and performance metrics</p>
              </div>
            </TabsContent>

            <TabsContent value="contracts" className="space-y-6">
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">Smart Contracts</h3>
                <p className="text-muted-foreground">Direct blockchain contract interactions</p>
              </div>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

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