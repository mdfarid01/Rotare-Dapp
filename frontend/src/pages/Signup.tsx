import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Wallet, Shield, Smartphone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { citreaTestnet } from '@/lib/wagmi';

const signupSteps = [
  {
    id: 1,
    title: 'Connect Wallet',
    description: 'Connect your MetaMask wallet to get started',
    icon: Wallet,
    status: 'pending'
  },
  {
    id: 2,
    title: 'Verify Identity',
    description: 'Complete KYC verification through Self Protocol',
    icon: Shield,
    status: 'pending'
  },
  {
    id: 3,
    title: 'Approve Transaction',
    description: 'Sign the transaction to complete registration',
    icon: Smartphone,
    status: 'pending'
  }
];

export const Signup: React.FC = () => {
  const { isConnected, address, chain } = useAccount();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isKycVerified, setIsKycVerified] = useState(false);
  const [steps, setSteps] = useState(signupSteps);

  useEffect(() => {
    // Check if already verified (from localStorage)
    const kycStatus = localStorage.getItem('kyc_verified');
    if (kycStatus === 'true' && isConnected) {
      navigate('/dashboard');
    }
  }, [isConnected, navigate]);

  useEffect(() => {
    if (isConnected && chain?.id === citreaTestnet.id) {
      setSteps(prev => prev.map(step => 
        step.id === 1 ? { ...step, status: 'completed' } : step
      ));
      setCurrentStep(2);
    }
  }, [isConnected, chain]);

  const handleKycVerification = () => {
    // Simulate KYC process
    setSteps(prev => prev.map(step => 
      step.id === 2 ? { ...step, status: 'completed' } : step
    ));
    setCurrentStep(3);
    setIsKycVerified(true);
  };

  const handleFinalApproval = () => {
    // Complete registration
    setSteps(prev => prev.map(step => 
      step.id === 3 ? { ...step, status: 'completed' } : step
    ));
    localStorage.setItem('kyc_verified', 'true');
    
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const getStepStatus = (stepId: number) => {
    const step = steps.find(s => s.id === stepId);
    return step?.status || 'pending';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold mb-4">Welcome to Rotare</h1>
          <p className="text-xl text-muted-foreground">
            Join the future of decentralized ROSCA savings pools
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Account Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    getStepStatus(step.id) === 'completed' 
                      ? 'border-success bg-success/20 text-success' 
                      : currentStep === step.id
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-muted text-muted-foreground'
                  }`}>
                    {getStepStatus(step.id) === 'completed' ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`font-semibold ${
                      getStepStatus(step.id) === 'completed' 
                        ? 'text-success' 
                        : currentStep === step.id
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {step.description}
                    </p>
                    
                    {/* Step Actions */}
                    {currentStep === step.id && (
                      <div className="mt-4">
                        {step.id === 1 && !isConnected && (
                          <p className="text-sm text-muted-foreground">
                            Use the "Connect Wallet" button in the top navigation
                          </p>
                        )}
                        
                        {step.id === 2 && isConnected && !isKycVerified && (
                          <Button 
                            onClick={handleKycVerification}
                            className="hover-glow"
                          >
                            Start KYC Verification
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                        
                        {step.id === 3 && isKycVerified && (
                          <Button 
                            onClick={handleFinalApproval}
                            className="hover-glow"
                          >
                            Complete Registration
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>What You'll Get Access To</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Create ROSCA Pots</h4>
                  <p className="text-sm text-muted-foreground">
                    Start your own savings pools with custom terms
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Join Active Pools</h4>
                  <p className="text-sm text-muted-foreground">
                    Participate in existing high-yield savings groups
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Dutch Auctions</h4>
                  <p className="text-sm text-muted-foreground">
                    Bid for early access to pot distributions
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Yield Generation</h4>
                  <p className="text-sm text-muted-foreground">
                    Earn returns while your funds are pooled
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};