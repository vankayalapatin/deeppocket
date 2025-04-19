'use client'

import { useState, useCallback } from 'react'
// --- ADDED: Import metadata type ---
import { usePlaidLink, PlaidLinkOnSuccessMetadata } from 'react-plaid-link'
// --- END ADDED ---
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface PlaidLinkModalProps {
  linkToken: string | null;
  // --- MODIFIED: Update onSuccess type definition ---
  onSuccess: (publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => void;
  // --- END MODIFIED ---
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
  // State removed as it wasn't used for PlaidLink readiness check in the button logic
  // const [isLinkReady, setIsLinkReady] = useState(false);

  const onPlaidSuccess = useCallback(
    // --- MODIFIED: Accept both arguments from usePlaidLink ---
    (public_token: string, metadata: PlaidLinkOnSuccessMetadata) => {
      setIsOpen(false); // Close the modal
      onSuccess(public_token, metadata); // Pass BOTH arguments to the parent component's handler
    },
    // --- END MODIFIED ---
    [onSuccess, setIsOpen] // Dependencies remain the same
  );

  const onPlaidExit = useCallback(() => {
    setIsOpen(false); // Close modal on exit
    onExit();
  }, [onExit, setIsOpen]);

  const { open, ready, error } = usePlaidLink({ // Destructure 'error' for potential debugging
    token: linkToken || '',
    onSuccess: onPlaidSuccess, // This callback now correctly matches usePlaidLink's signature
    onExit: onPlaidExit,
    // onEvent: (eventName, metadata) => { /* Optional: handle Plaid Link events */ }
  });

  // Log Plaid Link errors if any occur during initialization
  if (error) {
    console.error("Plaid Link Initialization Error: ", error);
    // Potentially display an error message to the user within the modal
  }

  // When the modal is open, try to open Plaid Link if it's ready
  // This replaces the button click logic if the modal content is just for triggering Plaid
  // Note: Plaid Link often opens immediately when 'open()' is called after 'ready' becomes true.
  // The button below might be redundant if Plaid opens automatically,
  // or it can serve as a manual trigger if automatic opening fails.

  // If you want Plaid Link to open automatically when the modal appears & Link is ready:
  /*
  useEffect(() => {
    if (isOpen && ready) {
      open();
    }
  }, [isOpen, ready, open]);
  */

  // Or keep the button click logic:
  const handleOpenClick = useCallback(() => {
    if (ready) {
      open();
    } else {
      console.log("Plaid Link not ready yet.");
      // Optionally show a message or handle the not-ready state
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
            Click below to securely connect your financial institution using Plaid.
          </p>
          <Button
            onClick={handleOpenClick} // Keep manual trigger
            disabled={!ready || !linkToken} // Disable until linkToken is fetched and Plaid is ready
            className="w-full"
          >
            {!linkToken ? 'Initializing...' : !ready ? 'Loading Plaid...' : 'Connect Securely'}
          </Button>
          {/* Optional: Display a loading indicator or message while !ready */}
        </div>
      </DialogContent>
    </Dialog>
  );
}