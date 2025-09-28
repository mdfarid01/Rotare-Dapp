import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'pending' | 'confirming' | 'success' | 'error';
  title: string;
  description?: string;
  txHash?: string;
  amount?: string;
  asset?: string;
  onRetry?: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  status,
  title,
  description,
  txHash,
  amount,
  asset,
  onRetry,
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Loader2 className="w-12 h-12 text-warning animate-spin" />;
      case 'success':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center"
          >
            <Check className="w-6 h-6 text-success" />
          </motion.div>
        );
      case 'error':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center"
          >
            <X className="w-6 h-6 text-destructive" />
          </motion.div>
        );
      default:
        return <AlertCircle className="w-12 h-12 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    const badgeProps = {
      pending: { variant: 'outline' as const, className: 'border-warning text-warning', children: 'Pending' },
      success: { variant: 'outline' as const, className: 'border-success text-success', children: 'Success' },
      error: { variant: 'outline' as const, className: 'border-destructive text-destructive', children: 'Failed' },
      idle: { variant: 'outline' as const, className: 'border-muted text-muted-foreground', children: 'Ready' },
    };
    
    return <Badge {...badgeProps[status]} />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="glass-card p-8 space-y-6 mx-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{title}</h2>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Status Indicator */}
              <div className="flex flex-col items-center space-y-4">
                {getStatusIcon()}
                {getStatusBadge()}
              </div>

              {/* Transaction Details */}
              {(amount || asset) && (
                <div className="glass-card p-4 space-y-2">
                  <h3 className="font-medium text-sm text-muted-foreground">Transaction Details</h3>
                  {amount && asset && (
                    <div className="flex justify-between">
                      <span className="text-sm">Amount:</span>
                      <span className="font-medium gradient-text">{amount} {asset}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              {description && (
                <p className="text-sm text-muted-foreground text-center">
                  {description}
                </p>
              )}

              {/* Transaction Hash */}
              {txHash && (
                <div className="glass-card p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Tx Hash:</span>
                    <div className="flex items-center space-x-2">
                      <code className="text-xs font-mono">{`${txHash.slice(0, 6)}...${txHash.slice(-4)}`}</code>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                {status === 'error' && onRetry && (
                  <Button 
                    onClick={onRetry} 
                    className="flex-1"
                    variant="outline"
                  >
                    Try Again
                  </Button>
                )}
                <Button 
                  onClick={onClose} 
                  className={`${status === 'error' && onRetry ? 'flex-1' : 'w-full'}`}
                  variant={status === 'success' ? 'default' : 'outline'}
                >
                  {status === 'pending' ? 'Close' : 'Done'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};