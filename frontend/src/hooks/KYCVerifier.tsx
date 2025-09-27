// ... keep existing code ...

"use client";

import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, AlertCircle, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

interface KYCVerifierProps {
  onVerified: () => void;
}

export function KYCVerifier({ onVerified }: KYCVerifierProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isKYCVerified = typeof window !== 'undefined' ? localStorage.getItem('kycVerified') === 'true' : false;

  if (isKYCVerified) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 p-2 bg-green-50 rounded-lg"
      >
        <CheckCircle className="h-5 w-5 text-green-600" />
        <span className="text-sm text-green-800 font-medium">Identity Verified</span>
      </motion.div>
    );
  }

  const handleVerify = () => {
    if (isVerifying) return;
    setIsVerifying(true);
    setShowQR(true);
    setError(null);
  };

  const handleConfirmVerification = () => {
    // In a real integration, this would poll for onchain event or receive callback
    // For now, manual confirm after user completes scan and signs tx in Self app + wallet
    localStorage.setItem('kycVerified', 'true');
    setVerified(true);
    setShowQR(false);
    setIsVerifying(false);
    onVerified();
  };

  const proofRequest = {
    type: 'SelfProofRequest',
    disclose: ['humanity', 'ageOver18', 'notSanctioned'],
    chain: 'celoAlfajores',
    appUrl: window.location.origin,
    nonce: Date.now().toString(),
  };
  const qrValue = JSON.stringify(proofRequest);

  return (
    <Dialog open={showQR || isVerifying} onOpenChange={setShowQR}>
      <DialogTrigger asChild>
        <Button 
          onClick={handleVerify}
          disabled={isVerifying}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          {isVerifying ? 'Starting Verification...' : <UserCheck className="h-4 w-4" /> + ' Verify Identity (KYC)'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Identity Verification</DialogTitle>
        </DialogHeader>
        <AnimatePresence mode="wait">
          {showQR && (
            <motion.div
              key="qr"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-4 p-4"
            >
              <p className="text-sm text-muted-foreground text-center">
                Scan this QR code with the Self Protocol app on your phone.{' '}
                <strong>Complete the proof generation and approve the transaction in your wallet to verify your identity.</strong>
              </p>
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <QRCodeCanvas value={qrValue} size={200} />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                This requests proof of humanity, age over 18, and no sanctions without revealing personal data.
              </p>
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-red-600"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </motion.div>
              )}
              <div className="flex gap-2">
                <Button onClick={() => setShowQR(false)} variant="outline" size="sm">
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmVerification} 
                  variant="default" 
                  size="sm"
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" /> I Have Completed Verification
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Click confirm only after scanning the QR and signing the verification transaction in your wallet.
              </p>
            </motion.div>
          )}
          {verified && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 p-4"
            >
              <CheckCircle className="h-12 w-12 text-green-600" />
              <h3 className="text-lg font-semibold">Verification Successful!</h3>
              <p className="text-sm text-muted-foreground">Your identity has been verified using Self Protocol.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

export default KYCVerifier;