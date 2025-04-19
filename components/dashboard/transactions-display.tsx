// components/dashboard/TransactionsDisplay.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Transaction, Institution, AccountBase } from 'plaid';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; // Ensure path is correct
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Ensure path is correct
import { Skeleton } from '@/components/ui/skeleton'; // Ensure path is correct
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Ensure path is correct
import { Button } from '@/components/ui/button'; // Ensure path is correct
import { Input } from '@/components/ui/input'; // Ensure path is correct
import { Label } from '@/components/ui/label'; // Ensure path is correct
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Ensure path is correct
import { Terminal, University } from 'lucide-react';
import Image from 'next/image';
import dayjs from 'dayjs';

// --- Helper Functions (Defined outside component) ---
const formatCurrency = (amount: number | null | undefined, currencyCode: string | null | undefined = 'USD'): string => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode ?? 'USD' }).format(amount);
};

const renderSkeleton = (index: number): React.ReactNode => (
    // Ensure no extra whitespace inside TableRow
    <TableRow key={`skeleton-${index}`}>
        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-4 w-16" /></TableCell>
    </TableRow>
);
// --- End Helper Functions ---


// Type for the response from /api/plaid/items
interface LinkedInstitutionInfo {
     item_id: string;
     institution: { institution_id: string | null; name: string | null; logo: string | null; };
}

// Interface for combined data needed by the component
interface ComponentData {
    transactions: Transaction[]; total_transactions: number; accounts: AccountBase[]; institution: Partial<Institution> | null;
}

const ITEMS_PER_PAGE = 25;
const initialComponentData: ComponentData = { transactions: [], total_transactions: 0, accounts: [], institution: null };

export default function TransactionsDisplay() {
    // --- State Declarations ---
    const [linkedInstitutions, setLinkedInstitutions] = useState<LinkedInstitutionInfo[]>([]);
    const [isLoadingInstitutions, setIsLoadingInstitutions] = useState<boolean>(true);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [componentData, setComponentData] = useState<ComponentData>(initialComponentData);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState<boolean>(true);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null); // Used in catch blocks and error display
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [startDate, setStartDate] = useState(dayjs().subtract(30, 'days').format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));

    // --- Fetch Linked Institutions ---
    useEffect(() => {
        const fetchLinkedItems = async () => {
            setIsLoadingInstitutions(true); // USE Setter
            setError(null); // USE Setter
            setLinkedInstitutions([]); // USE Setter
            setSelectedItemId(null);
            setComponentData(initialComponentData);
            console.log("[TransactionsDisplay] Fetching linked institutions list...");
            try {
                const response = await fetch('/api/plaid/items');
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Failed to fetch linked institutions');
                if (!result || typeof result.linkedInstitutions === 'undefined') throw new Error("Invalid items data format");
                const items: LinkedInstitutionInfo[] = result.linkedInstitutions;
                setLinkedInstitutions(items); // USE Setter
                if (items.length > 0) { setSelectedItemId(items[0].item_id); }
                else { setIsLoadingAccounts(false); setIsLoadingTransactions(false); }
            } catch (err: any) {
                console.error("[TransactionsDisplay] Fetch Linked Items Error:", err);
                setError(err.message || 'Failed to load institutions list.'); // USE Setter
                setIsLoadingAccounts(false); setIsLoadingTransactions(false);
            } finally {
                setIsLoadingInstitutions(false); // USE Setter
            }
        };
        fetchLinkedItems();
         // Intentionally empty dependency array to run only once on mount
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

     // --- Fetch Accounts for Selected Item ---
    useEffect(() => {
        const fetchAccountsForSelectedItem = async (itemId: string) => { // itemId IS USED here
            setIsLoadingAccounts(true);
            console.log(`[TransactionsDisplay] Fetching accounts for selected item: ${itemId}`); // itemId IS USED here
            try {
                const response = await fetch(`/api/plaid/accounts?itemId=${encodeURIComponent(itemId)}`); // itemId IS USED here
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || `Failed to fetch accounts for item ${itemId}`); // itemId IS USED here (in message)
                if (!result || !result.accounts || !result.institution) throw new Error("Invalid accounts data format");
                setComponentData(prev => ({ ...prev, accounts: result.accounts, institution: result.institution }));
                if(error?.toLowerCase().includes('account')) setError(null); // USE Setter
            } catch (err: any) {
                console.error(`[TransactionsDisplay] Fetch Accounts Error for item ${itemId}:`, err); // itemId IS USED here (in message)
                setError(err.message || `Failed to load accounts data.`); // USE Setter
                setComponentData(prev => ({ ...prev, accounts: [], institution: null }));
            } finally {
                setIsLoadingAccounts(false);
            }
        };

        if (selectedItemId) { fetchAccountsForSelectedItem(selectedItemId); }
        else { setIsLoadingAccounts(false); }
    // error state IS USED in dependency array
    }, [selectedItemId, error]);

    // --- Fetch Transactions ---
    // Parameters page, start, end, itemId ARE USED inside this function
    const fetchTransactions = useCallback(async (page: number, start: string, end: string, itemId: string) => {
        setIsLoadingTransactions(true);
        console.log(`[TransactionsDisplay] Fetching transactions page ${page}, Item: ${itemId}, Start: ${start}, End: ${end}`); // All params used
        const offset = (page - 1) * ITEMS_PER_PAGE;
        const params = new URLSearchParams({ startDate: start, endDate: end, count: String(ITEMS_PER_PAGE), offset: String(offset), itemId: itemId }); // All params used
        try {
            const response = await fetch(`/api/plaid/transactions?${params.toString()}`);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to fetch transactions');
            if (!result || typeof result.transactions === 'undefined' || typeof result.total_transactions === 'undefined') throw new Error("Invalid transactions data format");
            setComponentData(prev => ({ ...prev, transactions: result.transactions, total_transactions: result.total_transactions }));
             if(error?.toLowerCase().includes('transaction')) setError(null); // USE Setter
        } catch (err: any) {
            console.error("[TransactionsDisplay] Fetch Transactions Error:", err);
            setError(err.message || 'Failed to load transactions.'); // USE Setter
            setComponentData(prev => ({ ...prev, transactions: [], total_transactions: 0 }));
        } finally {
            setIsLoadingTransactions(false);
        }
    // error state IS USED in dependency array
    }, [error]);

    // Reset page on date/item change
    useEffect(() => { if (selectedItemId) { setCurrentPage(1); } }, [startDate, endDate, selectedItemId]);

    // Fetch transactions when relevant state changes
    useEffect(() => {
        if (dayjs(startDate).isValid() && dayjs(endDate).isValid() && selectedItemId && !isLoadingAccounts) {
            // Parameters ARE passed here
            fetchTransactions(currentPage, startDate, endDate, selectedItemId);
        } else if (!selectedItemId) {
            setComponentData(prev => ({...prev, transactions: [], total_transactions: 0}));
            setIsLoadingTransactions(false);
        }
    }, [currentPage, startDate, endDate, selectedItemId, isLoadingAccounts, fetchTransactions]);


    // --- Prepare Data for Rendering ---
    const accountMap = useMemo(() => {
        if (!componentData?.accounts) return new Map();
        return new Map(componentData.accounts.map(acc => [acc.account_id, { name: acc.name, mask: acc.mask }]));
    }, [componentData?.accounts]);

    const institutionName = useMemo(() => componentData?.institution?.name ?? '...', [componentData?.institution]);

    // isLoading* state variables ARE USED here
    const isLoading = isLoadingInstitutions || isLoadingAccounts || isLoadingTransactions;
    const showTransactionSkeleton = isLoadingTransactions || isLoadingAccounts || isLoadingInstitutions;
    const totalPages = componentData ? Math.ceil(componentData.total_transactions / ITEMS_PER_PAGE) : 0;

    // Message generation uses loading/selection state
    const noTransactionsMessage = isLoadingInstitutions ? 'Loading institutions...'
        : !selectedItemId ? 'Please select an institution.'
        : 'No transactions found for the selected period.';

    // --- Rendering Logic ---
    return (
        <div className="space-y-6">
            {/* --- Institution Selector & Date Filters --- */}
            {/* isLoadingInstitutions and linkedInstitutions ARE USED here */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
                 <div className="grid gap-1.5 w-full sm:w-auto sm:min_w-[250px]">
                      <Label htmlFor="institution-select">Institution</Label>
                      <Select value={selectedItemId ?? ''} onValueChange={(value) => { if (value) setSelectedItemId(value); }} disabled={isLoadingInstitutions || linkedInstitutions.length === 0}>
                          <SelectTrigger id="institution-select" className="w-full"><SelectValue placeholder="Select Institution..." /></SelectTrigger>
                          <SelectContent>
                               {isLoadingInstitutions ? ( <SelectItem value="loading" disabled>Loading...</SelectItem>
                             ) : linkedInstitutions.length > 0 ? (
                                 linkedInstitutions.map((itemInfo) => ( /* ... item options ... */ <SelectItem key={itemInfo.item_id} value={itemInfo.item_id}><div className="flex items-center gap-2">{itemInfo.institution.logo ? ( <Image src={`data:image/png;base64,${itemInfo.institution.logo}`} alt="" width={20} height={20} className="rounded"/> ) : <University className="h-5 w-5 text-muted-foreground" />}<span>{itemInfo.institution.name || 'Unknown Name'}</span></div></SelectItem> ))
                             ) : ( <SelectItem value="noitems" disabled>No accounts linked yet.</SelectItem> )}
                          </SelectContent>
                      </Select>
                  </div>
                 <div className='grid gap-1.5'>
                     <Label htmlFor="startDate">Start Date</Label>
                     <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={isLoading} />
                 </div>
                 <div className='grid gap-1.5'>
                     <Label htmlFor="endDate">End Date</Label>
                     <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={isLoading} />
                 </div>
            </div>

            {/* --- Transaction Table Card --- */}
            <Card>
                <CardHeader><CardTitle>Transactions for {institutionName}</CardTitle></CardHeader>
                <CardContent>
                    {/* error state IS USED here */}
                    {error && ( <Alert variant="destructive" className="my-4"><Terminal className="h-4 w-4" /> <AlertTitle>Error</AlertTitle> <AlertDescription>{error}</AlertDescription></Alert> )}

                    <Table>
                        <TableHeader>
                             {/* Ensure no whitespace between TableRow and TableHead */}
                             <TableRow><TableHead>Date</TableHead><TableHead>Name</TableHead><TableHead>Account</TableHead><TableHead className="text-right">Amount</TableHead></TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* showTransactionSkeleton IS USED here */}
                            {showTransactionSkeleton ? (
                                [...Array(5)].map((_, i) => renderSkeleton(i))
                            ) : componentData && componentData.transactions.length > 0 ? (
                                componentData.transactions.map((t) => {
                                    const accountDetails = accountMap.get(t.account_id);
                                    const displayAccountName = accountDetails ? `${accountDetails.name}.${accountDetails.mask}` : t.account_id;
                                    // Ensure no whitespace between TableRow and TableCell
                                    return (<TableRow key={t.transaction_id}><TableCell className="text-xs whitespace-nowrap">{t.date}</TableCell><TableCell className="font-medium text-sm max-w-[250px] truncate" title={t.merchant_name || t.name}>{t.merchant_name || t.name} {t.pending && <span className="ml-2 text-xs text-orange-500">(Pending)</span>}</TableCell><TableCell className="text-xs text-muted-foreground whitespace-nowrap" title={displayAccountName}>{displayAccountName}</TableCell><TableCell className={`text-right font-mono text-sm whitespace-nowrap ${t.amount >= 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(t.amount > 0 ? t.amount : t.amount * -1, t.iso_currency_code)}</TableCell></TableRow>);
                                })
                            ) : (
                                 // Empty State Row
                                <TableRow>
                                     {/* Ensure no extra whitespace */}
                                     <TableCell colSpan={4} className="text-center text-muted-foreground py-10">{noTransactionsMessage}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination uses isLoading, totalPages, currentPage */}
                     {componentData && totalPages > 1 && !isLoading && (
                         <div className="flex items-center justify-end space-x-2 py-4">
                             <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1 || isLoading}>Previous</Button>
                             <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
                             <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || isLoading}>Next</Button>
                         </div>
                     )}
                </CardContent>
            </Card>
        </div>
    );
}