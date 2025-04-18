'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { PlaidLinkModal } from './plaid-link-modal';
import { useToast } from "@/components/ui/use-toast";

export function AddAccountButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleAddAccount = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('Plaid Link Token:', data.linkToken);
        setLinkToken(data.linkToken);
        setIsModalOpen(true);
      } else {
        console.error('Error:', data.error);
        toast({
          title: "Error",
          description: data.error || "Failed to connect to financial services",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to fetch link token:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaidSuccess = async (publicToken: string) => {
    console.log('Public token received:', publicToken);
    try {
      // Exchange public token for access token
      const response = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ public_token: publicToken }),
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('Access token received and stored');
        toast({
          title: "Success!",
          description: "Your account was successfully connected",
        });
      } else {
        console.error('Token exchange error:', data.error);
        toast({
          title: "Connection Error",
          description: data.error || "Failed to finalize account connection",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to exchange token:', error);
      toast({
        title: "Connection Error",
        description: "Failed to complete account setup",
        variant: "destructive"
      });
    }
  };

  const handlePlaidExit = () => {
    console.log('Plaid Link exited');
    setLinkToken(null);
  };

  return (
    <>
      <Button onClick={handleAddAccount} disabled={isLoading}>
        <PlusCircle className="mr-2 h-4 w-4" />
        {isLoading ? 'Loading...' : 'Add Account'}
      </Button>
      
      <PlaidLinkModal
        linkToken={linkToken}
        onSuccess={handlePlaidSuccess}
        onExit={handlePlaidExit}
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
      />
    </>
  );
}