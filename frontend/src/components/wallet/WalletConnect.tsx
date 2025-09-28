import React from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, AlertTriangle } from 'lucide-react';
import { citreaTestnet } from '@/lib/wagmi';
import { useToast } from '@/hooks/use-toast';

export const WalletConnect: React.FC = () => {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { toast } = useToast();

  const handleConnect = () => {
    const metaMaskConnector = connectors.find(connector => connector.name === 'MetaMask');
    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector });
    } else {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to continue",
        variant: "destructive",
      });
    }
  };

  const handleSwitchNetwork = () => {
    switchChain({ chainId: citreaTestnet.id });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && address) {
    const isCorrectNetwork = chain?.id === citreaTestnet.id;

    return (
      <div className="flex items-center space-x-2">
        {!isCorrectNetwork && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSwitchNetwork}
            className="border-warning text-warning hover:bg-warning/10"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Switch to Citrea
          </Button>
        )}
        <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span className="text-sm font-medium">{formatAddress(address)}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => disconnect()}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isPending}
      className="hover-glow"
    >
      <Wallet className="w-4 h-4 mr-2" />
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
};