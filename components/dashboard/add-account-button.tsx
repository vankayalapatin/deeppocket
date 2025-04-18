// components/dashboard/add-account-button.tsx
'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export function AddAccountButton() {
  const [isLoading, setIsLoading] = useState(false);

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
        // For now, we're just logging the token
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Failed to fetch link token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleAddAccount} disabled={isLoading}>
      <PlusCircle className="mr-2 h-4 w-4" />
      {isLoading ? 'Loading...' : 'Add Account'}
    </Button>
  );
}