// app/api/plaid/transactions/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { plaidClient } from '@/lib/plaid';
import { decrypt } from '@/lib/encryption';
import { Transaction } from 'plaid';
import dayjs from 'dayjs'; // For easy date handling

export const dynamic = 'force-dynamic';

// Helper function to parse query params
const getQueryParam = (req: NextRequest, param: string, defaultValue: string | null = null): string | null => {
    return req.nextUrl.searchParams.get(param) || defaultValue;
};
const getQueryParamAsInt = (req: NextRequest, param: string, defaultValue: number): number => {
    const value = req.nextUrl.searchParams.get(param);
    return value ? parseInt(value, 10) : defaultValue;
};

export async function GET(request: NextRequest) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
        // 1. Authentication
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }
        const userId = session.user.id;

        // 2. Get and Decrypt Token
        const { data: itemData, error: dbError } = await supabase
            .from('plaid_items')
            .select('access_token') // Use correct field name
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (dbError || !itemData?.access_token) {
             console.error(`API [/api/plaid/transactions] DB Error or no token for user ${userId}:`, dbError);
            return NextResponse.json({ message: dbError?.message || 'Database error or no token found.' }, { status: 500 });
        }

        const accessToken = decrypt(itemData.access_token);
        if (!accessToken) {
             console.error(`API [/api/plaid/transactions] Decryption Failed for user ${userId}.`);
            return NextResponse.json({ message: 'Failed to process credentials.' }, { status: 500 });
        }

        // 3. Get Query Parameters for Pagination and Date Range
        // Dates: Default to last 30 days if not provided
        const defaultEndDate = dayjs().format('YYYY-MM-DD');
        const defaultStartDate = dayjs().subtract(30, 'days').format('YYYY-MM-DD');

        const startDate = getQueryParam(request, 'startDate', defaultStartDate)!;
        const endDate = getQueryParam(request, 'endDate', defaultEndDate)!;
        const count = getQueryParamAsInt(request, 'count', 100); // Default 100 transactions per page
        const offset = getQueryParamAsInt(request, 'offset', 0); // Default offset 0

        // Basic validation for dates
        if (!dayjs(startDate).isValid() || !dayjs(endDate).isValid()) {
             return NextResponse.json({ message: 'Invalid date format. Use YYYY-MM-DD.' }, { status: 400 });
        }

        // 4. Fetch Transactions from Plaid
        let transactions: Transaction[] = [];
        let total_transactions: number = 0;

        try {
            console.log(`API [/api/plaid/transactions] Fetching transactions for user ${userId} (Start: ${startDate}, End: ${endDate}, Count: ${count}, Offset: ${offset})...`);

            const transactionsResponse = await plaidClient.transactionsGet({
                access_token: accessToken,
                start_date: startDate,
                end_date: endDate,
                options: {
                    count: count,
                    offset: offset,
                    // include_personal_finance_category: true, // Add if you want category info
                },
            });

            transactions = transactionsResponse.data.transactions;
            total_transactions = transactionsResponse.data.total_transactions; // Get total for pagination

            console.log(`API [/api/plaid/transactions] Fetched ${transactions.length} of ${total_transactions} total transactions for user ${userId}.`);

        } catch (plaidError: any) {
            console.error(`API [/api/plaid/transactions] Plaid Error (TransactionsGet) for user ${userId}:`, plaidError.response?.data || plaidError.message);
             return NextResponse.json({ message: `Failed to fetch transactions: ${plaidError.response?.data?.error_message || plaidError.message}` }, { status: plaidError.response?.status || 500 });
        }

        // 5. Return Transactions and Total Count
        return NextResponse.json({ transactions, total_transactions });

    } catch (error: any) {
         console.error('API [/api/plaid/transactions] Unexpected Server Error:', error);
         return NextResponse.json({ message: 'An unexpected server error occurred.' }, { status: 500 });
    }
}