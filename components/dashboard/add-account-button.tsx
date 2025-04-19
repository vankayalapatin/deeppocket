// components/dashboard/AddAccountButton.tsx
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaidLink, PlaidLinkOnSuccessMetadata, PlaidLinkError } from 'react-plaid-link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export function AddAccountButton() {
    const [linkToken, setLinkToken] = useState<string | null>(null);
    const [isFetchingToken, setIsFetchingToken] = useState(false);
    const [isExchangingToken, setIsExchangingToken] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const [error, setError] = useState<string | null>(null); // Local error state

    const fetchLinkToken = useCallback(async () => {
        console.log("Attempting to fetch link token..."); // Log start
        setIsFetchingToken(true);
        setError(null);
        try {
            const response = await fetch('/api/plaid/create-link-token', { method: 'POST' });
            const responseBodyText = await response.text(); // Read body once
            console.log("fetchLinkToken response status:", response.status);
            console.log("fetchLinkToken response body:", responseBodyText);

            let data;
            try {
                 data = JSON.parse(responseBodyText); // Parse
            } catch(parseError) {
                 console.error("Failed to parse link token response:", parseError);
                 throw new Error(`Invalid response received from server (Status: ${response.status})`);
            }

            if (!response.ok) {
                 throw new Error(data.message || data.error || 'Failed to fetch link token');
            }
            // *** This check should now pass ***
            if (!data.link_token) {
                 console.error("Parsed data missing link_token:", data);
                 throw new Error('Received invalid link token data');
            }
            setLinkToken(data.link_token); // Set the correct snake_case token
            console.log("Link token fetched successfully");
        } catch (error: any) {
            console.error("Error fetching link token:", error);
            setError(`Failed to initialize account linking: ${error.message}`);
             toast({
                 title: "Initialization Error",
                 description: `Could not initialize account linking: ${error.message}`,
                 variant: "destructive",
             });
            setLinkToken(null);
        } finally {
            setIsFetchingToken(false);
        }
    }, [toast]);


    const onSuccess = useCallback(async (publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
        // ... (onSuccess logic remains the same as previous correct version) ...
        console.log("Plaid Link Success - Public Token:", publicToken);
        console.log("Plaid Link Success - Metadata:", metadata);
        if (!metadata.institution?.institution_id) {
             console.error("Plaid metadata missing institution details.");
             toast({ title: "Link Error", description: "Missing institution details.", variant: "destructive" });
             return;
        }
        setIsExchangingToken(true);
        setError(null);
        try {
            console.log("Sending public token and institution to backend...");
            const response = await fetch('/api/plaid/exchange-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    public_token: publicToken,
                    institution: metadata.institution
                }),
            });
            const responseText = await response.text();
            console.log("Exchange Backend response status:", response.status);
            console.log("Exchange Backend response body:", responseText);
            let data;
            try { data = JSON.parse(responseText); }
            catch (parseError) { throw new Error(`Invalid response from exchange server (Status: ${response.status})`); }
            if (!response.ok) { throw new Error(data.message || `Token exchange failed with status: ${response.status}`); }
            console.log("Token exchange and initial sync successful:", data);
            toast({ title: "Account Linked!", description: `${metadata.institution.name} connected.` });
            router.refresh();
        } catch (error: any) {
            console.error("Token exchange fetch/processing error:", error);
             toast({ title: "Linking Error", description: `Could not link account: ${error.message}`, variant: "destructive" });
             setError(`Linking failed: ${error.message}`);
        } finally {
             setIsExchangingToken(false);
        }
    }, [router, toast]);


    const onError = useCallback((error: PlaidLinkError) => {
        // ... (onError logic remains the same) ...
        console.error('Plaid Link Error:', error);
        toast({ title: "Plaid Link Error", description: error.display_message || error.error_message || `Code: ${error.error_code}`, variant: "destructive" });
    }, [toast]);

    const onExit = useCallback((error: PlaidLinkError | null, metadata: PlaidLinkOnSuccessMetadata) => {
       // ... (onExit logic remains the same) ...
        console.log('Plaid Link Exit. Error:', error, 'Metadata:', metadata);
    }, []);

    const { open, ready, error: plaidLinkError } = usePlaidLink({
        token: linkToken,
        onSuccess,
        onError,
        onExit,
    });

    useEffect(() => {
        if (!linkToken && !isFetchingToken) { // Fetch only if token is null AND not already fetching
            fetchLinkToken();
        }
    }, [linkToken, isFetchingToken, fetchLinkToken]);


     useEffect(() => {
         if (plaidLinkError) {
            // ... (plaidLinkError handling remains the same) ...
             console.error("Plaid Link Hook Error:", plaidLinkError);
             setError(`Plaid initialization failed: ${plaidLinkError.message}`);
             toast({ title: "Initialization Error", description: `Plaid Link failed: ${plaidLinkError.message}`, variant: "destructive" });
         }
     }, [plaidLinkError, toast]);


    const handleAddAccountClick = () => {
        // ... (handleAddAccountClick logic remains the same) ...
        if (ready && linkToken) {
            open();
        } else if (!linkToken && !isFetchingToken) {
            console.log("Link token not ready or null, attempting refetch...");
            fetchLinkToken();
             toast({ title: "Initializing...", description: "Please wait..." });
        }
    };


    return (
        <>
            <Button
                onClick={handleAddAccountClick}
                disabled={!ready || isFetchingToken || isExchangingToken || !linkToken}
            >
                {isFetchingToken ? 'Initializing...' : isExchangingToken ? 'Connecting...' : '+ Add Account'}
            </Button>
             {/* {error && <p className="text-red-500 text-sm mt-2">{error}</p>} */}
        </>
    );
}