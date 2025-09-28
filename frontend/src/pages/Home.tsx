import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, TrendingUp, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FloatingParticles } from '@/components/ui/floating-particles';

const features = [
  {
    icon: Users,
    title: 'Collaborative Savings',
    description: 'Join rotating savings pools with friends and earn together',
    color: 'from-primary to-primary-glow',
  },
  {
    icon: TrendingUp,
    title: 'Yield Generation',
    description: 'Earn competitive APY on your locked funds through DeFi protocols',
    color: 'from-secondary to-accent',
  },
  {
    icon: Zap,
    title: 'Dutch Auctions',
    description: 'Bid for early access to funds with transparent pricing',
    color: 'from-accent to-secondary',
  },
  {
    icon: Shield,
    title: 'Blockchain Security',
    description: 'Built on Citrea Testnet with smart contract transparency',
    color: 'from-success to-primary',
  },
];

const stats = [
  { label: 'Total Value Locked', value: '$2.45M', change: '+12.3%' },
  { label: 'Active Pools', value: '127', change: '+8.7%' },
  { label: 'Community Members', value: '1,240', change: '+23.1%' },
  { label: 'Average APY', value: '8.2%', change: '+1.4%' },
];

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles count={30} />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <Badge variant="outline" className="border-primary text-primary px-4 py-1">
              Built on Citrea Testnet
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="gradient-text">Rotare Finance</span>
              <br />
              <span className="text-foreground">DeFi ROSCAs</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Revolutionary rotating savings and credit associations powered by blockchain. 
              Pool funds, earn yield, and access capital through transparent Dutch auctions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6 hover-glow">
                <Link to="/dashboard">
                  Start Saving
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 hover-lift">
                <Link to="/create-pot">Create Pool</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <Card key={stat.label} className="glass-card hover-lift">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold gradient-text">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                  <Badge variant="outline" className="mt-2 border-success text-success">
                    {stat.change}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose <span className="gradient-text">Rotare</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of collaborative finance with cutting-edge Web3 technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
              >
                <Card className="glass-card hover-lift h-full group">
                  <CardContent className="p-8 text-center space-y-4">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="glass-card p-12 space-y-8"
          >
            <h2 className="text-4xl font-bold">
              Ready to Start Your <span className="gradient-text">DeFi Journey</span>?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of users already earning yield through collaborative savings
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6 hover-glow">
                <Link to="/signup">
                  Get Started Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                <Link to="/dashboard">Explore Dashboard</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};