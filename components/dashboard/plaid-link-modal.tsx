'use client'

import { useState, useCallback } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface PlaidLinkModalProps {
  linkToken: string | null;
  onSuccess: (publicToken: string) => void;
  onExit: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function PlaidLinkModal({ 
  linkToken, 
  onSuccess, 
  onExit, 
  isOpen, 
  setIsOpen 
}: PlaidLinkModalProps) {
  const [isLinkReady, setIsLinkReady] = useState(false);

  const onPlaidSuccess = useCallback(
    (public_token: string) => {
      setIsOpen(false);
      onSuccess(public_token);
    },
    [onSuccess, setIsOpen]
  );

  const onPlaidExit = useCallback(() => {
    setIsOpen(false);
    onExit();
  }, [onExit, setIsOpen]);

  const { open, ready } = usePlaidLink({
    token: linkToken || '',
    onSuccess: onPlaidSuccess,
    onExit: onPlaidExit,
  });

  // When the link is ready and the modal opens, trigger Plaid Link
  const handleOpenClick = useCallback(() => {
    if (ready) {
      open();
    }
  }, [ready, open]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Your Bank Account</DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <p className="text-muted-foreground mb-4">
            Connect your financial accounts securely to track your finances.
          </p>
          <Button 
            onClick={handleOpenClick} 
            disabled={!ready || !linkToken}
            className="w-full"
          >
            {!ready || !linkToken ? 'Loading...' : 'Connect Your Account'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}