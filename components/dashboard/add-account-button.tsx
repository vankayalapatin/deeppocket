// components/dashboard/add-account-button.tsx
'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { PlaidLinkModal } from './plaid-link-modal'; // Assuming PlaidLinkModal passes both args to onSuccess
import { useToast } from "@/components/ui/use-toast";
import type { PlaidLinkOnSuccessMetadata } from 'react-plaid-link'; // Import the type

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
        setIsModalOpen(true); // Open modal when token is ready
      } else {
        console.error('Error creating link token:', data.error);
        toast({
          title: "Error",
          description: data.error || "Failed to initialize connection",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to fetch link token:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while preparing connection",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- MODIFIED: Accept metadata ---
  const handlePlaidSuccess = async (publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
    console.log('Public token received:', publicToken);
    console.log('Plaid metadata:', metadata); // Log metadata for debugging

    // --- ADDED: Extract institution details ---
    const institutionId = metadata.institution?.institution_id;
    const institutionName = metadata.institution?.name;

    if (!institutionId || !institutionName) {
       console.error("Could not extract institution details from Plaid metadata.");
       toast({
         title: "Connection Error",
         description: "Could not get institution details. Please try again.",
         variant: "destructive"
       });
       setIsModalOpen(false); // Close modal on error
       return;
    }
    // --- END ADDED ---

    setIsModalOpen(false); // Close the modal immediately on success start
    setIsLoading(true); // Show loading state on the button while exchanging token

    try {
      // Exchange public token for access token
      const response = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // --- MODIFIED: Send institution details ---
        body: JSON.stringify({
          public_token: publicToken,
          institution_id: institutionId,
          institution_name: institutionName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Access token received and stored for institution:', data.institution); // Use institution name from response
        toast({
          title: "Success!",
          description: `${data.institution || 'Your account'} was successfully connected.`, // Use institution name from response
        });
        // TODO: Trigger data refresh if needed (e.g., re-fetch accounts list)
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
        description: "Failed to complete account setup. Please check your network.",
        variant: "destructive"
      });
    } finally {
       setIsLoading(false); // Stop loading state on button
    }
  };

  const handlePlaidExit = () => {
    console.log('Plaid Link exited');
    setLinkToken(null); // Clear link token
    setIsModalOpen(false); // Ensure modal is closed
  };

  return (
    <>
      <Button onClick={handleAddAccount} disabled={isLoading}>
        <PlusCircle className="mr-2 h-4 w-4" />
        {isLoading ? 'Connecting...' : 'Add Account'}
      </Button>

      {/* Ensure PlaidLinkModal calls onSuccess(publicToken, metadata) */}
      <PlaidLinkModal
        linkToken={linkToken}
        onSuccess={handlePlaidSuccess} // Pass the modified handler
        onExit={handlePlaidExit}
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
      />
    </>
  );
}