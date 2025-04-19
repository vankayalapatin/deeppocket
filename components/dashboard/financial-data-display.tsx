// components/dashboard/FinancialDataDisplay.tsx
'use client'; // This component fetches data client-side

import React, { useState, useEffect, useMemo } from 'react';
import { AccountBase, Transaction } from 'plaid'; // Import Plaid types
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, AlertTriangle } from 'lucide-react'; // Import AlertTriangle for warning icon

interface FinancialData {
    accounts: AccountBase[];
    transactions: Transaction[];
    totalBalance: number;
    transactionError?: string; // Capture potential transaction fetching errors
}

// Helper to format currency
const formatCurrency = (amount: number | null | undefined, currencyCode: string | null | undefined = 'USD') => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode ?? 'USD' }).format(amount);
};

export default function FinancialDataDisplay() {
    const [data, setData] = useState<FinancialData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // --- FIX 1: Moved useMemo hooks before conditional returns ---
    // Calculate simple Income/Expenses (Example - refine based on your needs)
    const monthlyIncome = useMemo(() => {
        if (!data?.transactions) return 0; // Handle case where data/transactions are not yet available
        return data.transactions
            .filter(t => t.amount < 0 && !t.pending) // Negative amount usually means inflow for depository
            .reduce((sum, t) => sum - t.amount, 0); // Sum positive values
    }, [data?.transactions]); // Depend on transactions array

    const monthlyExpenses = useMemo(() => {
        if (!data?.transactions) return 0; // Handle case where data/transactions are not yet available
        return data.transactions
            .filter(t => t.amount > 0 && !t.pending) // Positive amount usually means outflow for depository
            .reduce((sum, t) => sum + t.amount, 0);
    }, [data?.transactions]); // Depend on transactions array
    // --- End of FIX 1 ---


    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            setData(null);
            console.log("[FinancialDataDisplay] Fetching data...");
            try {
                const response = await fetch('/api/plaid/data');
                console.log(`[FinancialDataDisplay] API Response Status: ${response.status}`);

                const result = await response.json();

                if (!response.ok) {
                     console.error("[FinancialDataDisplay] API Error Response:", result);
                    throw new Error(result.message || `Failed to fetch data. Status: ${response.status}`);
                }

                console.log("[FinancialDataDisplay] API Data Received:", result);
                 if (!result || typeof result.accounts === 'undefined' || typeof result.transactions === 'undefined' || typeof result.totalBalance === 'undefined') {
                    throw new Error("Received invalid data format from API.");
                }

                setData(result as FinancialData);

            } catch (err: any) {
                console.error("[FinancialDataDisplay] Fetch Error:", err);
                setError(err.message || 'An unexpected error occurred while loading financial data.');
            } finally {
                setIsLoading(false);
                 console.log("[FinancialDataDisplay] Fetching complete.");
            }
        };

        fetchData();
    }, []);


    // --- Loading State ---
    if (isLoading) {
       // ... (Skeleton loading state remains the same as before)
        return (
            <>
                {/* Placeholder for Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-1/2 mt-2" />
                        </CardContent>
                    </Card>
                    <Card>
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Income</CardTitle>
                        </CardHeader>
                       <CardContent>
                             <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-1/2 mt-2" />
                        </CardContent>
                    </Card>
                    <Card>
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Expenses</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-1/2 mt-2" />
                        </CardContent>
                    </Card>
                </div>

                {/* Placeholder for Transactions Table */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                     <Card className="md:col-span-2"> {/* Span across both columns for loading */}
                        <CardHeader>
                            <CardTitle>Recent Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-10 w-full mb-2" />
                            <Skeleton className="h-10 w-full mb-2" />
                            <Skeleton className="h-10 w-full mb-2" />
                             <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }

    // --- Error State ---
    if (error) {
        return (
             <Alert variant="destructive" className="my-6"> {/* Use destructive for fetch errors */}
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Loading Data</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    // --- No Data / Empty State ---
     if (!data || (data.accounts.length === 0 && data.transactions.length === 0 && !data.transactionError)) { // Added check for transactionError here
       // ... (Empty state remains the same as before)
       return (
            <>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">$0.00</p>
                            <p className="text-xs text-muted-foreground pt-1">Add an account to get started</p>
                        </CardContent>
                    </Card>
                     <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Monthly Income</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">$0.00</p><p className="text-xs text-muted-foreground pt-1">No income data available</p></CardContent></Card>
                     <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Monthly Expenses</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">$0.00</p><p className="text-xs text-muted-foreground pt-1">No expense data available</p></CardContent></Card>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                     <Card>
                        <CardHeader><CardTitle className="text-lg font-medium">Monthly Spending</CardTitle></CardHeader>
                        <CardContent className="h-64 flex items-center justify-center text-muted-foreground"><p>Connect an account to view your spending breakdown</p></CardContent>
                    </Card>
                     <Card>
                         <CardHeader><CardTitle className="text-lg font-medium">Recent Transactions</CardTitle></CardHeader>
                        <CardContent className="h-64 flex items-center justify-center text-muted-foreground"><p>No recent transactions to display</p></CardContent>
                    </Card>
                </div>
            </>
        );
    }

    // --- Data Display State ---
    // We can safely assume 'data' is non-null here due to the early returns
    const { accounts, transactions, totalBalance, transactionError } = data;

    return (
        <>
             {/* ----- Summary Cards ----- */}
             {/* ... (Summary cards remain the same using calculated monthlyIncome/Expenses) ... */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
                        <p className="text-xs text-muted-foreground pt-1">Across {accounts.length} account(s)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Income (Last 30d)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(monthlyIncome)}</div>
                         <p className="text-xs text-muted-foreground pt-1">{transactions.filter(t=>t.amount<0).length} incoming transaction(s)</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Expenses (Last 30d)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(monthlyExpenses)}</div>
                        <p className="text-xs text-muted-foreground pt-1">{transactions.filter(t=>t.amount>0).length} outgoing transaction(s)</p>
                    </CardContent>
                </Card>
            </div>

             {/* --- FIX 2: Changed Alert variant --- */}
             {/* Potential Transaction Fetching Error Message */}
            {transactionError && (
                 <Alert variant="destructive" className="mb-6"> {/* Use "destructive" or "default" */}
                    <AlertTriangle className="h-4 w-4" /> {/* Using a warning icon */}
                    <AlertTitle>Transaction Issue</AlertTitle>
                    <AlertDescription>{transactionError}</AlertDescription>
                </Alert>
            )}
             {/* --- End of FIX 2 --- */}


            {/* ----- Recent Transactions Table ----- */}
             {/* ... (Transaction table/chart area remains the same) ... */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Monthly Spending Chart Placeholder */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-medium">Monthly Spending</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
                        <p>Spending chart coming soon!</p>
                    </CardContent>
                </Card>

                {/* Transactions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-medium">Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {transactions.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.slice(0, 10).map((t) => (
                                        <TableRow key={t.transaction_id}>
                                            <TableCell className="text-xs">{t.date}</TableCell>
                                            <TableCell className="font-medium text-sm max-w-[150px] truncate" title={t.name}>{t.name}</TableCell>
                                            <TableCell className={`text-right font-mono text-sm ${t.amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {formatCurrency(t.amount > 0 ? t.amount : t.amount * -1, t.iso_currency_code)} {/* Show outflows as positive */}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                {!transactionError && <p>No transactions found for the last 30 days.</p>}
                                {transactionError && <p>Could not load transactions.</p> /* Different message if fetch failed */}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}