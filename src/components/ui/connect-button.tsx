import { useState } from "react";
import { Button } from "./button";
import { Wallet, Loader2 } from "lucide-react";

interface ConnectButtonProps {
  isConnecting: boolean;
  setIsConnecting: (connecting: boolean) => void;
}

export function ConnectButton({ isConnecting, setIsConnecting }: ConnectButtonProps) {
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // Check if MetaMask is installed
      if (window.ethereum) {
        try {
          // Request account access
          await window.ethereum.request({ method: 'eth_requestAccounts' });
        } catch (error: any) {
          setError(error.message || "Failed to connect to wallet");
        }
      } else {
        setError("Please install MetaMask or another Ethereum wallet");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred while connecting");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div>
      <Button 
        onClick={connectWallet} 
        disabled={isConnecting}
        className="w-full"
      >
        {isConnecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </>
        )}
      </Button>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
} 