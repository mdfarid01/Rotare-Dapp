import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Users, Clock, DollarSign, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { useTransactionModal } from '@/hooks/useTransactionModal';
import { TransactionModal } from '@/components/ui/transaction-modal';

interface PotData {
  name: string;
  description: string;
  goalAmount: string;
  duration: string;
  minContribution: string;
  maxMembers: string;
  cycleFrequency: string;
  bidPercentage: string;
  latePenalty: string;
}

const steps = [
  { id: 1, title: 'Basic Info', icon: Users },
  { id: 2, title: 'Terms', icon: Clock },
  { id: 3, title: 'Advanced', icon: Settings },
  { id: 4, title: 'Review', icon: DollarSign },
];

export const CreatePot: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [potData, setPotData] = useState<PotData>({
    name: '',
    description: '',
    goalAmount: '',
    duration: '',
    minContribution: '',
    maxMembers: '',
    cycleFrequency: '',
    bidPercentage: '',
    latePenalty: '',
  });

  const { modalState, simulateTransaction, closeModal, retryTransaction } = useTransactionModal();

  const handleInputChange = (field: keyof PotData, value: string) => {
    setPotData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    await simulateTransaction(
      'Create ROSCA Pot',
      potData.goalAmount,
      'cBTC',
      'Creating your new ROSCA pot on the blockchain...'
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Pot Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., High Yield Savings Pool"
                  value={potData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your ROSCA pot and its purpose..."
                  value={potData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="mt-1 h-24"
                />
              </div>
              
              <div>
                <Label htmlFor="goalAmount">Goal Amount (cBTC) *</Label>
                <Input
                  id="goalAmount"
                  type="number"
                  step="0.001"
                  placeholder="1.0"
                  value={potData.goalAmount}
                  onChange={(e) => handleInputChange('goalAmount', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Terms & Configuration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration (months) *</Label>
                <Select onValueChange={(value) => handleInputChange('duration', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 months</SelectItem>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="24">24 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="maxMembers">Maximum Members *</Label>
                <Select onValueChange={(value) => handleInputChange('maxMembers', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select max members" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 members</SelectItem>
                    <SelectItem value="8">8 members</SelectItem>
                    <SelectItem value="10">10 members</SelectItem>
                    <SelectItem value="15">15 members</SelectItem>
                    <SelectItem value="20">20 members</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="minContribution">Min Contribution (cBTC) *</Label>
                <Input
                  id="minContribution"
                  type="number"
                  step="0.001"
                  placeholder="0.1"
                  value={potData.minContribution}
                  onChange={(e) => handleInputChange('minContribution', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="cycleFrequency">Cycle Frequency *</Label>
                <Select onValueChange={(value) => handleInputChange('cycleFrequency', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Advanced Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bidPercentage">Bid Percentage *</Label>
                <Input
                  id="bidPercentage"
                  type="number"
                  min="1"
                  max="20"
                  placeholder="5"
                  value={potData.bidPercentage}
                  onChange={(e) => handleInputChange('bidPercentage', e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Percentage for Dutch auction bidding (1-20%)
                </p>
              </div>
              
              <div>
                <Label htmlFor="latePenalty">Late Penalty (%) *</Label>
                <Input
                  id="latePenalty"
                  type="number"
                  min="0"
                  max="10"
                  placeholder="2"
                  value={potData.latePenalty}
                  onChange={(e) => handleInputChange('latePenalty', e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Late payment penalty (0-10%)
                </p>
              </div>
            </div>
            
            <div className="glass-card p-4">
              <h3 className="font-semibold mb-2">Smart Contract Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Automated yield distribution</li>
                <li>• Transparent Dutch auctions</li>
                <li>• Emergency withdrawal protection</li>
                <li>• Multi-signature governance</li>
              </ul>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Review & Deploy</h2>
            
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-semibold">Pot Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{potData.name || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Goal Amount:</span>
                    <span className="font-medium gradient-text">{potData.goalAmount || '0'} cBTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{potData.duration || 'Not set'} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Members:</span>
                    <span className="font-medium">{potData.maxMembers || 'Not set'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Min Contribution:</span>
                    <span className="font-medium">{potData.minContribution || '0'} cBTC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cycle Frequency:</span>
                    <span className="font-medium capitalize">{potData.cycleFrequency || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bid Percentage:</span>
                    <span className="font-medium">{potData.bidPercentage || '0'}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Late Penalty:</span>
                    <span className="font-medium">{potData.latePenalty || '0'}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            {potData.description && (
              <div className="glass-card p-4">
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{potData.description}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

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
            <h1 className="text-3xl font-bold">Create ROSCA Pot</h1>
            <p className="text-muted-foreground">Set up a new rotating savings pool</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center space-x-2 ${
                currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  currentStep >= step.id 
                    ? 'border-primary bg-primary/20' 
                    : 'border-muted'
                }`}>
                  <step.icon className="w-4 h-4" />
                </div>
                <span className="font-medium hidden sm:block">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <Card className="glass-card">
          <CardContent className="p-8">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < 4 ? (
            <Button onClick={handleNext} className="hover-glow">
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="hover-glow">
              Deploy Pot
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
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