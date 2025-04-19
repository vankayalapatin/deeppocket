// components/dashboard/TransactionsDisplay.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Transaction, Institution, AccountBase } from 'plaid';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Terminal } from 'lucide-react';
import dayjs from 'dayjs';

interface ComponentData {
    transactions: Transaction[];
    total_transactions: number;
    accounts: AccountBase[];
    institution: Institution | null;
}

const formatCurrency = (amount: number | null | undefined, currencyCode: string | null | undefined = 'USD') => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode ?? 'USD' }).format(amount);
};

const ITEMS_PER_PAGE = 25;

const initialComponentData: ComponentData = {
    transactions: [],
    total_transactions: 0,
    accounts: [],
    institution: null,
};

export default function TransactionsDisplay() {
    const [componentData, setComponentData] = useState<ComponentData>(initialComponentData);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState<boolean>(true);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [startDate, setStartDate] = useState(dayjs().subtract(30, 'days').format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));

    // --- Fetch Accounts and Institution Data ---
    useEffect(() => {
        const fetchAccountData = async () => {
            // ... fetch logic (same as before) ...
            setIsLoadingAccounts(true);
            setError(null);
            console.log("[TransactionsDisplay] Fetching accounts/institution data...");
            try {
                const response = await fetch('/api/plaid/accounts');
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Failed to fetch account details');
                if (!result || typeof result.accounts === 'undefined' || typeof result.institution === 'undefined') {
                    throw new Error("Received invalid accounts data format from API.");
                }
                setComponentData(prev => ({
                    ...prev,
                    transactions: prev.transactions ?? [],
                    total_transactions: prev.total_transactions ?? 0,
                    accounts: result.accounts,
                    institution: result.institution,
                }));
            } catch (err: any) {
                console.error("[TransactionsDisplay] Fetch Account/Institution Error:", err);
                setError(err.message || 'Failed to load account details.');
                setComponentData(initialComponentData);
            } finally {
                setIsLoadingAccounts(false);
                console.log("[TransactionsDisplay] Account/Institution fetching complete.");
            }
        };
        fetchAccountData();
    }, []);

    // --- Fetch Transactions Data ---
    const fetchTransactions = useCallback(async (page: number, start: string, end: string) => {
        // ... fetch logic (same as before) ...
        setIsLoadingTransactions(true);
        console.log(`[TransactionsDisplay] Fetching transactions page ${page}, Start: ${start}, End: ${end}`);
        const offset = (page - 1) * ITEMS_PER_PAGE;
        const params = new URLSearchParams({ startDate: start, endDate: end, count: String(ITEMS_PER_PAGE), offset: String(offset) });
        try {
            const response = await fetch(`/api/plaid/transactions?${params.toString()}`);
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to fetch transactions');
            if (!result || typeof result.transactions === 'undefined' || typeof result.total_transactions === 'undefined') {
                throw new Error("Received invalid transactions data format from API.");
            }
            setComponentData(prev => ({
                 ...prev,
                 accounts: prev.accounts ?? [],
                 institution: prev.institution ?? null,
                 transactions: result.transactions,
                 total_transactions: result.total_transactions,
            }));
             if(error?.toLowerCase().includes('transaction')) setError(null);
        } catch (err: any) {
            console.error("[TransactionsDisplay] Fetch Transactions Error:", err);
            const errorMsg = err.message || 'An unexpected error occurred while loading transactions.';
            setError(errorMsg);
            setComponentData(prev => ({
                ...prev,
                accounts: prev.accounts ?? [],
                institution: prev.institution ?? null,
                transactions: [],
                total_transactions: 0,
            }));
        } finally {
            setIsLoadingTransactions(false);
            console.log("[TransactionsDisplay] Transactions fetching complete.");
        }
    }, [error]); // Added error dependency back, check if needed

    // --- useEffect Hooks for date changes and fetching ---
     useEffect(() => {
         // ... (same as before) ...
        if (dayjs(startDate).isValid() && dayjs(endDate).isValid()) {
             setCurrentPage(1);
         } else {
            setError("Invalid date format selected.");
            setComponentData(prev => ({ ...prev, transactions: [], total_transactions: 0 }));
             setIsLoadingTransactions(false);
         }
     }, [startDate, endDate]);

     useEffect(() => {
        // ... (same as before) ...
          if (dayjs(startDate).isValid() && dayjs(endDate).isValid()) {
              if (!isLoadingAccounts) {
                 fetchTransactions(currentPage, startDate, endDate);
              }
          }
     }, [currentPage, startDate, endDate, isLoadingAccounts, fetchTransactions]);

    // --- Prepare Data for Rendering (Memoization) ---
    const accountMap = useMemo(() => {
        // ... (same as before) ...
        return new Map(componentData.accounts.map(acc => [acc.account_id, { name: acc.name, mask: acc.mask }]));
    }, [componentData.accounts]);

    const institutionName = useMemo(() => {
        // ... (same as before) ...
        return componentData.institution?.name ?? 'Unknown Inst.';
    }, [componentData.institution]);

    const isLoading = isLoadingAccounts || isLoadingTransactions;
    const totalPages = Math.ceil(componentData.total_transactions / ITEMS_PER_PAGE);

    // --- **FIX:** Moved renderSkeleton inside the component body ---
    const renderSkeleton = (index: number) => (
        <TableRow key={`skeleton-${index}`}>
            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell className="text-right"><Skeleton className="h-4 w-16" /></TableCell>
        </TableRow>
    );
    // --- End of FIX ---


    // --- Rendering Logic ---
    return (
        <Card>
            <CardHeader>
                <CardTitle>Transactions</CardTitle>
                <div className="flex flex-col sm:flex-row gap-4 mt-4 pt-4 border-t">
                    {/* ... Date filter inputs ... */}
                    <div className='grid gap-1.5'>
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={isLoading} />
                    </div>
                    <div className='grid gap-1.5'>
                        <Label htmlFor="endDate">End Date</Label>
                        <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={isLoading} />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                 {/* Error Display */}
                 {error && (
                     <Alert variant="destructive" className="my-4">
                         <Terminal className="h-4 w-4" />
                         <AlertTitle>Error</AlertTitle>
                         <AlertDescription>{error}</AlertDescription>
                     </Alert>
                 )}

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Account</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Loading State */}
                        {isLoading ? (
                             [...Array(ITEMS_PER_PAGE > 10 ? 10 : ITEMS_PER_PAGE)].map((_, i) => renderSkeleton(i))
                        // Data State
                        ) : componentData.transactions.length > 0 ? (
                            componentData.transactions.map((t) => {
                                const accountDetails = accountMap.get(t.account_id);
                                const displayAccountName = accountDetails
                                    ? `${institutionName}.${accountDetails.name}.${accountDetails.mask}`
                                    : t.account_id; // Fallback

                                return (
                                    <TableRow key={t.transaction_id}>
                                        <TableCell className="text-xs whitespace-nowrap">{t.date}</TableCell>
                                        <TableCell className="font-medium text-sm max-w-[250px] truncate" title={t.merchant_name || t.name}>
                                             {t.merchant_name || t.name}
                                             {t.pending && <span className="ml-2 text-xs text-orange-500">(Pending)</span>}
                                         </TableCell>
                                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap" title={displayAccountName}>
                                            {displayAccountName}
                                        </TableCell>
                                        <TableCell className={`text-right font-mono text-sm whitespace-nowrap ${t.amount >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {formatCurrency(t.amount > 0 ? t.amount : t.amount * -1, t.iso_currency_code)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        // Empty State
                        ) : (
                             <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                                    No transactions found for the selected period.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Pagination Controls */}
                 {totalPages > 1 && !isLoading && (
                     <div className="flex items-center justify-end space-x-2 py-4">
                         {/* ... Pagination buttons ... */}
                         <Button
                             variant="outline"
                             size="sm"
                             onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                             disabled={currentPage === 1 || isLoading}
                         >
                             Previous
                         </Button>
                         <span className="text-sm text-muted-foreground">
                             Page {currentPage} of {totalPages}
                         </span>
                         <Button
                             variant="outline"
                             size="sm"
                             onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                             disabled={currentPage === totalPages || isLoading}
                         >
                             Next
                         </Button>
                     </div>
                 )}
            </CardContent>
        </Card>
    );
}