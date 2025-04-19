// components/dashboard/AccountsDisplay.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AccountBase, Institution } from 'plaid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// Import Select components from shadcn/ui (or your library)
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from '@/components/ui/label';
import { Terminal, University } from 'lucide-react';
import Image from 'next/image';

// Type for the response from /api/plaid/items
interface LinkedInstitutionInfo {
     item_id: string;
     institution: Institution;
}

// Type for the response from /api/plaid/accounts?itemId=...
interface AccountsData {
    accounts: AccountBase[];
    institution: Institution | null; // Institution details for the *selected* item
}

const formatCurrency = (amount: number | null | undefined, currencyCode: string | null | undefined = 'USD') => {
    // ... formatter remains same ...
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode ?? 'USD' }).format(amount);
};


export default function AccountsDisplay() {
    // State for the list of linked institutions (for dropdown)
    const [linkedInstitutions, setLinkedInstitutions] = useState<LinkedInstitutionInfo[]>([]);
    const [isLoadingInstitutions, setIsLoadingInstitutions] = useState<boolean>(true);
    // State for the selected item ID from the dropdown
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    // State for the accounts/institution details of the *selected* item
    const [selectedAccountData, setSelectedAccountData] = useState<AccountsData | null>(null);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(false); // Start false, true when selection changes
    const [error, setError] = useState<string | null>(null);


    // --- Fetch Linked Institutions (for Dropdown) ---
    useEffect(() => {
        const fetchLinkedItems = async () => {
            setIsLoadingInstitutions(true);
            setError(null);
            setLinkedInstitutions([]); // Clear previous
            setSelectedItemId(null); // Clear selection
            setSelectedAccountData(null); // Clear displayed accounts
            console.log("[AccountsDisplay] Fetching linked institutions list...");
            try {
                const response = await fetch('/api/plaid/items');
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Failed to fetch linked institutions');
                if (!result || typeof result.linkedInstitutions === 'undefined') {
                     throw new Error("Received invalid items data format from API.");
                }

                const items: LinkedInstitutionInfo[] = result.linkedInstitutions;
                setLinkedInstitutions(items);

                // If items are found, automatically select the first one
                if (items.length > 0) {
                    setSelectedItemId(items[0].item_id);
                } else {
                    // Handle case where user has no linked items at all
                     console.log("[AccountsDisplay] No linked items found for user.");
                }

            } catch (err: any) {
                console.error("[AccountsDisplay] Fetch Linked Items Error:", err);
                setError(err.message || 'Failed to load institutions list.');
            } finally {
                setIsLoadingInstitutions(false);
            }
        };
        fetchLinkedItems();
    }, []); // Run only once on mount


    // --- Fetch Accounts for Selected Item ID ---
    const fetchAccountsForSelectedItem = useCallback(async (itemId: string) => {
        setIsLoadingAccounts(true);
        setError(null); // Clear previous errors when fetching new accounts
        setSelectedAccountData(null); // Clear previous account data
        console.log(`[AccountsDisplay] Fetching accounts for selected item: ${itemId}`);

        try {
            const response = await fetch(`/api/plaid/accounts?itemId=${encodeURIComponent(itemId)}`); // Pass itemId
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || `Failed to fetch accounts for item ${itemId}`);
            if (!result || typeof result.accounts === 'undefined' || typeof result.institution === 'undefined') {
                 throw new Error("Received invalid accounts data format from API for selected item.");
            }
            setSelectedAccountData(result as AccountsData);

        } catch (err: any) {
            console.error(`[AccountsDisplay] Fetch Accounts Error for item ${itemId}:`, err);
             setError(err.message || `Failed to load accounts for the selected institution.`);
             setSelectedAccountData(null); // Ensure data is cleared on error
        } finally {
            setIsLoadingAccounts(false);
        }
    }, []); // useCallback to memoize the function

    // Effect to trigger fetching accounts when selectedItemId changes
    useEffect(() => {
        if (selectedItemId) {
            fetchAccountsForSelectedItem(selectedItemId);
        } else {
            // If no item is selected (e.g., user has no items), clear account data
            setSelectedAccountData(null);
            setIsLoadingAccounts(false);
        }
    }, [selectedItemId, fetchAccountsForSelectedItem]); // Depend on selectedItemId


    // --- Render Logic ---

    // Loading state for the dropdown population
    if (isLoadingInstitutions) {
        return (
             <div className="space-y-4">
                 <Skeleton className="h-8 w-48" /> {/* Dropdown placeholder */}
                 <Skeleton className="h-40 w-full" /> {/* Account area placeholder */}
            </div>
        );
    }

     // Handle case where user has no linked accounts at all
     if (linkedInstitutions.length === 0 && !isLoadingInstitutions) {
         return (
             <Card>
                 <CardHeader><CardTitle>No Linked Accounts</CardTitle></CardHeader>
                 <CardContent><p className="text-muted-foreground">Please add a bank account to get started.</p></CardContent>
                 {/* Consider adding AddAccountButton here or nearby */}
             </Card>
         );
     }


    return (
        <div className="space-y-6">
            {/* Institution Selection Dropdown */}
            <div className="w-full sm:w-1/2 lg:w-1/3">
                <Label htmlFor="institution-select">Select Institution</Label>
                 <Select
                     value={selectedItemId ?? ''} // Controlled component value
                     onValueChange={(value) => setSelectedItemId(value)} // Update state on change
                     disabled={isLoadingInstitutions || isLoadingAccounts} // Disable while loading
                 >
                     <SelectTrigger id="institution-select">
                         <SelectValue placeholder="Select an institution..." />
                     </SelectTrigger>
                     <SelectContent>
                         {linkedInstitutions.map((itemInfo) => (
                             <SelectItem key={itemInfo.item_id} value={itemInfo.item_id}>
                                 {/* Display institution name in dropdown */}
                                 <div className="flex items-center gap-2">
                                     {itemInfo.institution.logo ? (
                                         <Image src={`data:image/png;base64,${itemInfo.institution.logo}`} alt="" width={20} height={20} className="rounded"/>
                                     ) : <University className="h-5 w-5" />}
                                     <span>{itemInfo.institution.name}</span>
                                 </div>
                             </SelectItem>
                         ))}
                     </SelectContent>
                 </Select>
             </div>

             {/* Display Area for Selected Institution's Accounts */}
             <div>
                 {/* Loading state for accounts of the selected institution */}
                 {isLoadingAccounts && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                         {[...Array(3)].map((_, i) => (
                             <Card key={i}><CardHeader><Skeleton className="h-5 w-3/4 mb-2"/><Skeleton className="h-4 w-1/2"/></CardHeader><CardContent><Skeleton className="h-8 w-1/2 mb-1"/><Skeleton className="h-4 w-1/3"/></CardContent></Card>
                         ))}
                     </div>
                 )}

                 {/* Error display for account fetching */}
                 {error && !isLoadingAccounts && (
                     <Alert variant="destructive" className="my-6">
                         <Terminal className="h-4 w-4" />
                         <AlertTitle>Error Loading Accounts</AlertTitle>
                         <AlertDescription>{error}</AlertDescription>
                     </Alert>
                 )}

                 {/* Display accounts if loaded and no error */}
                 {!isLoadingAccounts && !error && selectedAccountData && selectedAccountData.accounts.length > 0 && selectedAccountData.institution && (
                     <>
                         {/* Display Institution Header for selected item */}
                         <div className="mb-6 flex items-center space-x-4 p-4 border rounded-lg bg-card mt-4">
                             {/* ... (Institution header display logic - same as before, using selectedAccountData.institution) ... */}
                             {selectedAccountData.institution.logo ? (
                                <Image src={`data:image/png;base64,${selectedAccountData.institution.logo}`} alt={`${selectedAccountData.institution.name} Logo`} width={40} height={40} className="rounded"/>
                             ) : ( <University className="h-10 w-10 text-muted-foreground" /> )}
                             <div>
                                <h2 className="text-xl font-semibold">{selectedAccountData.institution.name}</h2>
                                {selectedAccountData.institution.url && ( <a href={selectedAccountData.institution.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">{selectedAccountData.institution.url}</a> )}
                            </div>
                         </div>
                         {/* Display Accounts Grid for selected item */}
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* ... (Account card mapping logic - same as before, using selectedAccountData.accounts) ... */}
                            {selectedAccountData.accounts.map((account) => (
                                <Card key={account.account_id} className="flex flex-col justify-between">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{account.name}</CardTitle>
                                        {account.official_name && account.official_name !== account.name && ( <CardDescription>({account.official_name})</CardDescription> )}
                                        <CardDescription className="capitalize pt-1">{account.subtype} ({account.type}) - *{account.mask}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xl font-semibold">{formatCurrency(account.balances.current)}<span className="text-sm font-normal text-muted-foreground ml-1">{account.balances.iso_currency_code}</span></p>
                                        {account.balances.available !== null && account.balances.available !== account.balances.current && ( <p className="text-sm text-muted-foreground">Available: {formatCurrency(account.balances.available)}</p> )}
                                        {account.type === 'credit' && account.balances.limit !== null && ( <p className="text-sm text-muted-foreground">Limit: {formatCurrency(account.balances.limit)}</p> )}
                                    </CardContent>
                                </Card>
                            ))}
                         </div>
                     </>
                 )}

                 {/* Handle case where selected item has 0 accounts */}
                 {!isLoadingAccounts && !error && selectedAccountData && selectedAccountData.accounts.length === 0 && (
                     <Card className="mt-4">
                         <CardHeader><CardTitle>No Accounts Found</CardTitle></CardHeader>
                         <CardContent><p className="text-muted-foreground">No accounts were found for the selected institution ({selectedAccountData.institution?.name || 'N/A'}).</p></CardContent>
                     </Card>
                 )}
             </div>
         </div>
    );
}