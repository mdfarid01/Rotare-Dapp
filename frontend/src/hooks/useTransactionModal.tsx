import { useState } from 'react';
import { useToast } from './use-toast';

interface TransactionState {
  isOpen: boolean;
  status: 'pending' | 'confirming' | 'success' | 'error';
  title: string;
  description: string;
  txHash?: string;
  amount?: string;
  asset?: string;
}

export const useTransactionModal = () => {
  const { toast } = useToast();
  const [modalState, setModalState] = useState<TransactionState>({
    isOpen: false,
    status: 'pending',
    title: '',
    description: '',
  });

  const simulateTransaction = async (title: string, amount: string, asset: string, description: string) => {
    setModalState({
      isOpen: true,
      status: 'pending',
      title,
      description: 'Please confirm the transaction in MetaMask...',
      amount,
      asset,
    });

    try {
      // This would trigger MetaMask popup in real implementation
      toast({
        title: "MetaMask Required",
        description: "Please confirm the transaction in your MetaMask wallet",
      });

      // Simulate transaction flow
      setTimeout(() => {
        setModalState(prev => ({
          ...prev,
          status: 'confirming',
          description: 'Transaction submitted, waiting for confirmation...',
          txHash: '0x' + Math.random().toString(16).substring(2, 66),
        }));
      }, 3000);

      setTimeout(() => {
        setModalState(prev => ({
          ...prev,
          status: 'success',
          description: 'Transaction confirmed successfully!',
        }));
      }, 6000);

    } catch (error) {
      setModalState(prev => ({
        ...prev,
        status: 'error',
        description: 'Transaction failed or was rejected',
      }));
      
      toast({
        title: "Transaction Failed",
        description: "The transaction was rejected or failed to process",
        variant: "destructive",
      });
    }
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const retryTransaction = () => {
    setModalState(prev => ({ ...prev, status: 'pending' }));
  };

  return {
    modalState,
    simulateTransaction,
    closeModal,
    retryTransaction,
  };
};