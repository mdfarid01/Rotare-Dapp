import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Activity, Database, Settings, Shield, TrendingUp, Users, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useAccount } from 'wagmi';
import { useToast } from '@/hooks/use-toast';

const profileStats = [
  {
    title: 'Total Pots Joined',
    value: '8',
    change: '+2 this month',
    icon: Users,
    color: 'from-primary to-primary-glow',
  },
  {
    title: 'Cycles Won',
    value: '3',
    change: '37.5% win rate',
    icon: Award,
    color: 'from-success to-primary',
  },
  {
    title: 'Total Contributions',
    value: '12.45 cBTC',
    change: '+2.1 cBTC this month',
    icon: TrendingUp,
    color: 'from-secondary to-accent',
  },
  {
    title: 'Reputation Score',
    value: '98/100',
    change: 'Excellent standing',
    icon: Shield,
    color: 'from-accent to-primary',
  },
];

const userPots = [
  { id: 1, name: 'High Yield Pool', role: 'Creator', tvl: '45.2 cBTC', apy: '8.2%', status: 'active' },
  { id: 2, name: 'Stable Growth', role: 'Member', tvl: '23.1 cBTC', apy: '6.5%', status: 'active' },
  { id: 3, name: 'Quick Return', role: 'Member', tvl: '12.8 cBTC', apy: '11.4%', status: 'completed' },
];

export const Profile: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [isRegistered, setIsRegistered] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [cycleId, setCycleId] = useState('');

  const handleRegisterMember = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to register",
        variant: "destructive",
      });
      return;
    }

    try {
      // This would trigger MetaMask popup for transaction signing
      toast({
        title: "Registration Initiated",
        description: "Please confirm the transaction in MetaMask",
      });
      
      // Simulate registration process
      setTimeout(() => {
        setIsRegistered(true);
        toast({
          title: "Registration Successful",
          description: "You are now registered as a member",
        });
      }, 3000);
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Transaction was rejected or failed",
        variant: "destructive",
      });
    }
  };

  const handleUpdateBid = async () => {
    if (!bidAmount || !cycleId) return;

    try {
      toast({
        title: "Updating Bid",
        description: "Please confirm the transaction in MetaMask",
      });
      
      setTimeout(() => {
        toast({
          title: "Bid Updated",
          description: `Bid of ${bidAmount} cBTC updated for cycle ${cycleId}`,
        });
        setBidAmount('');
        setCycleId('');
      }, 2000);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Transaction was rejected or failed",
        variant: "destructive",
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="glass-card max-w-md">
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">
              Please connect your wallet to access your profile
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            Profile Management
          </motion.h1>
          <p className="text-muted-foreground mt-1">
            Manage your ROSCA membership and track your performance
          </p>
        </div>
        
        {!isRegistered && (
          <Button onClick={handleRegisterMember} className="hover-glow">
            <User className="w-4 h-4 mr-2" />
            Register as Member
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {profileStats.map((stat, index) => (
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

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
          <TabsTrigger value="queries">Queries</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Registration Status */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Registration Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {isRegistered ? 'Registered Member' : 'Not Registered'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isRegistered 
                      ? 'You can participate in all ROSCA activities' 
                      : 'Register to start participating in ROSCA pots'
                    }
                  </p>
                </div>
                <Badge variant={isRegistered ? "default" : "secondary"}>
                  {isRegistered ? 'Active' : 'Pending'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* My Pots */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>My ROSCA Pots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userPots.map((pot) => (
                  <div key={pot.id} className="glass-card p-4 hover-lift">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{pot.name}</h4>
                        <p className="text-sm text-muted-foreground">Role: {pot.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold gradient-text">{pot.tvl}</p>
                        <p className="text-sm text-success">{pot.apy}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interactions" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Update Bid Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cycleId">Cycle ID</Label>
                  <Input
                    id="cycleId"
                    placeholder="Enter cycle ID"
                    value={cycleId}
                    onChange={(e) => setCycleId(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="bidAmount">Bid Amount (cBTC)</Label>
                  <Input
                    id="bidAmount"
                    type="number"
                    step="0.001"
                    placeholder="0.0"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                onClick={handleUpdateBid}
                disabled={!bidAmount || !cycleId}
                className="hover-glow"
              >
                Update Bid
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queries" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Contract Queries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Query blockchain data and contract states
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Administrative Functions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Admin controls for contract owners only
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};