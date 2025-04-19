// app/api/plaid/data/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { plaidClient } from '@/lib/plaid'; // Adjust path if needed
import { decrypt } from '@/lib/encryption';   // Use YOUR decrypt function
import { AccountBase, Transaction } from 'plaid'; // Import Plaid types
import dayjs from 'dayjs'; // Using dayjs for easier date manipulation

export const dynamic = 'force-dynamic'; // Ensure fresh data on each request

export async function GET() {
    const cookieStore = cookies();
    // Use createRouteHandlerClient for Route Handlers
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
        // 1. Authenticate User
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
            console.error("API Authentication Error:", sessionError?.message || "No session");
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }
        const userId = session.user.id;
        console.log(`[API /api/plaid/data] Authenticated user: ${userId}`); // Add logging

        // 2. Retrieve Encrypted Access Token from Supabase
        // Ensure table/column names match your schema: 'plaid_items', 'user_id', 'encrypted_access_token'
        const { data: itemData, error: dbError } = await supabase
            .from('plaid_items')
            .select('access_token')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }) // Get the latest one if multiple exist
            .limit(1)
            .maybeSingle();

        if (dbError) {
            console.error(`[API /api/plaid/data] Supabase DB Error fetching token for user ${userId}:`, dbError);
            return NextResponse.json({ message: 'Database error fetching Plaid item.' }, { status: 500 });
        }

        if (!itemData?.access_token) {
            console.log(`[API /api/plaid/data] No Plaid item found for user ${userId}.`);
            // It's okay if the user hasn't linked an account yet. Return empty data.
            return NextResponse.json({ accounts: [], transactions: [], totalBalance: 0 }, { status: 200 });
        }
         console.log(`[API /api/plaid/data] Found encrypted token for user ${userId}.`);

        // 3. Decrypt Access Token using your decrypt function
        const accessToken = decrypt(itemData.access_token); // Use your decrypt function

        if (!accessToken) { // Your decrypt function returns null on error
            console.error(`[API /api/plaid/data] Access Token Decryption Failed for user ${userId}. Check encryption key and data format.`);
            // Log appropriately, but don't expose sensitive details to client
            return NextResponse.json({ message: 'Failed to process Plaid credentials.' }, { status: 500 });
        }
        console.log(`[API /api/plaid/data] Successfully decrypted access token for user ${userId}.`);

        // 4. Fetch Accounts from Plaid
        let accounts: AccountBase[] = [];
        try {
            console.log(`[API /api/plaid/data] Fetching accounts from Plaid for user ${userId}...`);
            const accountsResponse = await plaidClient.accountsGet({ access_token: accessToken });
            accounts = accountsResponse.data.accounts;
            console.log(`[API /api/plaid/data] Fetched ${accounts.length} accounts for user ${userId}.`);
        } catch (plaidError: any) {
            console.error(`[API /api/plaid/data] Plaid API Error (AccountsGet) for user ${userId}:`, plaidError.response?.data || plaidError.message);
            // Consider how to handle Plaid errors (e.g., ITEM_LOGIN_REQUIRED -> trigger update mode?)
             return NextResponse.json({ message: `Failed to fetch accounts from Plaid: ${plaidError.response?.data?.error_message || plaidError.message}` }, { status: plaidError.response?.status || 500 });
        }

        // Calculate Total Balance (only from depository and investment accounts)
        const totalBalance = accounts
            .filter(acc => ['depository', 'investment'].includes(acc.type))
            .reduce((sum, acc) => sum + (acc.balances.current ?? 0), 0);
         console.log(`[API /api/plaid/data] Calculated total balance: ${totalBalance} for user ${userId}.`);


        // 5. Fetch Transactions from Plaid
        let transactions: Transaction[] = [];
        try {
            // Define date range (e.g., last 30 days)
            const endDate = dayjs().format('YYYY-MM-DD');
            const startDate = dayjs().subtract(30, 'days').format('YYYY-MM-DD');
             console.log(`[API /api/plaid/data] Fetching transactions from Plaid (${startDate} to ${endDate}) for user ${userId}...`);

            const transactionsResponse = await plaidClient.transactionsGet({
                access_token: accessToken,
                start_date: startDate,
                end_date: endDate,
                options: {
                    count: 100, // Adjust count as needed
                    offset: 0,
                    // include_personal_finance_category: true // Uncomment if you need detailed categories
                },
            });
            transactions = transactionsResponse.data.transactions;
             console.log(`[API /api/plaid/data] Fetched ${transactions.length} transactions for user ${userId}.`);

            // TODO: Implement pagination if transactionsResponse.data.total_transactions > count

        } catch (plaidError: any) {
            console.error(`[API /api/plaid/data] Plaid API Error (TransactionsGet) for user ${userId}:`, plaidError.response?.data || plaidError.message);
            // Return accounts and balance even if transactions fail? Or return error?
            // Let's return what we have so far, but indicate transaction error.
             return NextResponse.json({
                 accounts,
                 transactions: [], // Return empty transactions on error
                 totalBalance,
                 transactionError: `Failed to fetch transactions: ${plaidError.response?.data?.error_message || plaidError.message}`
             }, { status: 200 }); // Still 200 OK, but with error message in payload
            // Or return a 5xx error:
            // return NextResponse.json({ message: `Failed to fetch transactions from Plaid: ${plaidError.response?.data?.error_message || plaidError.message}` }, { status: plaidError.response?.status || 500 });
        }


        // 6. Return Data
         console.log(`[API /api/plaid/data] Successfully returning data for user ${userId}.`);
        return NextResponse.json({ accounts, transactions, totalBalance });

    } catch (error: any) {
        console.error('[API /api/plaid/data] Unexpected Server Error:', error);
        return NextResponse.json({ message: 'An unexpected server error occurred.' }, { status: 500 });
    }
}