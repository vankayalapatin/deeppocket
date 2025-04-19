// app/api/plaid/exchange-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { plaidClient } from '@/lib/plaid';
import { encrypt } from '@/lib/encryption';
import { Transaction, AccountBase, CountryCode, InstitutionsGetByIdRequest } from 'plaid';
import dayjs from 'dayjs';

export const dynamic = 'force-dynamic';

// --- Mapping Functions (Ensure these match your FINAL DB schema) ---
const mapPlaidAccountToDb = (account: AccountBase, userId: string, itemId: string) => ({
    item_id: itemId,                   // Plaid's item ID (TEXT)
    user_id: userId,                   // Your user ID (UUID)
    account_id: account.account_id,    // Plaid's account ID (TEXT)
    name: account.name,
    mask: account.mask,
    official_name: account.official_name,
    type: account.type,
    subtype: account.subtype,
    currency: account.balances.iso_currency_code,
    current_balance: account.balances.current,
    available_balance: account.balances.available,
    "limit": account.balances.limit,   // Column named "limit" (NUMERIC)
});

const mapPlaidTransactionToDb = (transaction: Transaction, userId: string, itemId: string) => ({
    user_id: userId,                   // Your user ID (UUID)
    item_id: itemId,                   // Plaid's item ID (TEXT)
    account_id: transaction.account_id, // Plaid's account ID (TEXT) - Link to account
    transaction_id: transaction.transaction_id, // Plaid's transaction ID (TEXT) - UNIQUE
    category_primary: transaction.personal_finance_category?.primary ?? (transaction.category?.[0] || null), // Store primary category (TEXT)
    category_detailed: transaction.personal_finance_category?.detailed ?? (transaction.category?.slice(-1)[0] || null), // Store detailed category (TEXT)
    name: transaction.name,
    merchant_name: transaction.merchant_name,
    amount: transaction.amount,        // NUMERIC
    currency: transaction.iso_currency_code, // Store currency (TEXT)
    date: transaction.date,            // Store date (DATE)
    pending: transaction.pending,      // BOOLEAN
    payment_channel: transaction.payment_channel, // TEXT
    is_removed: false,                 // Default to false (BOOLEAN)
});
// --- End Mapping Functions ---

// Helper function to safely get environment variables
const getEnvVar = (varName: string, defaultValue?: string): string => {
    const value = process.env[varName];
    if (value) return value;
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`${varName} environment variable is not set and no default was provided.`);
};


export async function POST(request: NextRequest) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
        // 1. Authenticate User
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) {
            console.error("API [/api/plaid/exchange-token] Auth Error:", sessionError?.message || "No session");
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }
        const userId = session.user.id;
        console.log(`API [/api/plaid/exchange-token] User: ${userId}`);

        // 2. Get & Log payload
        let payload;
        try {
             payload = await request.json();
             console.log("API [/api/plaid/exchange-token] Received payload:", JSON.stringify(payload, null, 2));
        } catch (e) {
             console.error("API [/api/plaid/exchange-token] Failed to parse request body:", e);
             return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
        }
        const { public_token, institution: institutionMeta } = payload;

        // 3. Validate Payload
        if (!public_token || !institutionMeta || !institutionMeta.institution_id) {
            console.warn(`API [/api/plaid/exchange-token] Validation Failed: Missing data. Payload: ${JSON.stringify(payload)}`);
            return NextResponse.json({ message: 'Missing public_token or institution data' }, { status: 400 });
        }
        const institutionId = institutionMeta.institution_id;
        const institutionName = institutionMeta.name;

        // 4. Exchange public_token (Calls Plaid)
        let exchangeResponse;
        try {
            console.log(`API [/api/plaid/exchange-token] Exchanging public token for user ${userId}`);
            exchangeResponse = await plaidClient.itemPublicTokenExchange({ public_token });
        } catch (error: any) {
             console.error(`API [/api/plaid/exchange-token] Plaid token exchange error for user ${userId}:`, error.response?.data || error.message);
             return NextResponse.json({ message: 'Failed to exchange Plaid token.' }, { status: 500 });
        }
        const accessToken = exchangeResponse.data.access_token;
        const itemId = exchangeResponse.data.item_id;
        console.log(`API [/api/plaid/exchange-token] Exchange successful for user ${userId}, item ${itemId}`);

        // 5. Encrypt Access Token
        const encryptedAccessToken = encrypt(accessToken);
        if (!encryptedAccessToken) {
            console.error(`API [/api/plaid/exchange-token] Failed to encrypt access token for user ${userId}, item ${itemId}`);
            return NextResponse.json({ message: 'Failed to secure access token.' }, { status: 500 });
        }

        // 6. Fetch Full Institution Details (Calls Plaid)
        let institutionLogoBase64: string | null = null;
        try {
            console.log(`API [/api/plaid/exchange-token] Fetching institution details for ${institutionId}`);
            const countryCodes = (getEnvVar('PLAID_COUNTRY_CODES', 'US')).split(',') as CountryCode[];
            const requestParams: InstitutionsGetByIdRequest = {
                 institution_id: institutionId,
                 country_codes: countryCodes,
                 options: { include_optional_metadata: true }
            };
            const institutionResponse = await plaidClient.institutionsGetById(requestParams);
            institutionLogoBase64 = institutionResponse.data.institution.logo ?? null;
            console.log(`API [/api/plaid/exchange-token] Fetched institution logo: ${institutionLogoBase64 ? 'Yes' : 'No'}`);
        } catch (error: any) {
             console.error(`API [/api/plaid/exchange-token] Failed to fetch institution details for ${institutionId}:`, error.response?.data || error.message);
             // Continue without logo if fetch fails
        }

        // --- Start DB Operations ---
        // 7. Insert/Update Plaid Item in DB 'plaid_items' table
        console.log(`API [/api/plaid/exchange-token] Upserting plaid_item for user ${userId}, item ${itemId}`);
        const { error: itemUpsertError } = await supabase
            .from('plaid_items')
            .upsert({
                user_id: userId,
                item_id: itemId,
                institution_id: institutionId,
                institution_name: institutionName,
                institution_logo_base64: institutionLogoBase64, // Save logo
                access_token: encryptedAccessToken, // Ensure this column name matches DB
                status: 'good',
                sync_cursor: null, // Initialize sync fields
                last_sync_completed_at: null,
                last_sync_error: null,
            }, { onConflict: 'user_id, item_id' }); // Requires UNIQUE constraint on (user_id, item_id)

        if (itemUpsertError) {
            console.error(`API [/api/plaid/exchange-token] Supabase item upsert error for user ${userId}, item ${itemId}:`, itemUpsertError);
            // Check if it's the constraint error specifically
            if (itemUpsertError.message.includes('constraint matching the ON CONFLICT specification')) {
                 console.error(">>> Ensure a UNIQUE constraint exists on (user_id, item_id) in the 'plaid_items' table! <<<");
            }
            return NextResponse.json({ message: 'Failed to save Plaid item link.' }, { status: 500 });
        }
        console.log(`API [/api/plaid/exchange-token] Item upserted for user ${userId}, item ${itemId}`);


        // 8. Fetch Initial Accounts (Calls Plaid)
        let initialAccounts: AccountBase[];
        try {
            console.log(`API [/api/plaid/exchange-token] Fetching initial accounts for item ${itemId}`);
            const accountsResponse = await plaidClient.accountsGet({ access_token: accessToken });
            initialAccounts = accountsResponse.data.accounts;
            console.log(`API [/api/plaid/exchange-token] Fetched ${initialAccounts.length} accounts for item ${itemId}`);
        } catch (error: any) {
            console.error(`API [/api/plaid/exchange-token] Plaid accountsGet error for item ${itemId}:`, error.response?.data || error.message);
            // Consider updating item status to 'error_fetching_accounts' here
            await supabase.from('plaid_items').update({ status: 'error_fetching_accounts', last_sync_error: 'Failed to fetch accounts' }).match({ user_id: userId, item_id: itemId });
            return NextResponse.json({ message: 'Failed to fetch accounts after linking.' }, { status: 500 });
        }

        // 9. Insert/Update Accounts into Supabase 'plaid_accounts' table
        if (initialAccounts && initialAccounts.length > 0) {
            const accountsToInsert = initialAccounts.map(acc => mapPlaidAccountToDb(acc, userId, itemId));
            console.log(`API [/api/plaid/exchange-token] Upserting ${accountsToInsert.length} accounts for item ${itemId}`);
            const { error: accountsUpsertError } = await supabase
                 .from('plaid_accounts')
                 .upsert(accountsToInsert, { onConflict: 'user_id, account_id' }); // Requires UNIQUE constraint on (user_id, account_id)

            if (accountsUpsertError) {
                 console.error(`API [/api/plaid/exchange-token] Supabase accounts upsert error for item ${itemId}:`, accountsUpsertError);
                 if (accountsUpsertError.message.includes('constraint matching the ON CONFLICT specification')) {
                      console.error(">>> Ensure a UNIQUE constraint exists on (user_id, account_id) in the 'plaid_accounts' table! <<<");
                 }
                 // Decide if you want to fail the whole process here
                 await supabase.from('plaid_items').update({ status: 'error_saving_accounts', last_sync_error: 'Failed to save accounts' }).match({ user_id: userId, item_id: itemId });
                 return NextResponse.json({ message: 'Failed to save accounts.' }, { status: 500 });
            }
        } else {
            console.log(`API [/api/plaid/exchange-token] No accounts found to insert for item ${itemId}`);
        }

        // 10. Fetch Initial Transactions (Calls Plaid)
        console.log(`API [/api/plaid/exchange-token] Fetching initial transactions for item ${itemId}`);
        // Recommended: Fetch a longer history initially if possible (e.g., 1-2 years)
        // Adjust based on your Plaid plan limits and user expectations. 90 days used here.
        const startDate = dayjs().subtract(90, 'days').format('YYYY-MM-DD');
        const endDate = dayjs().format('YYYY-MM-DD');
        let allTransactions: Transaction[] = [];
        let hasMore = true;
        let offset = 0;
        const count = 100; // Fetch in batches

        while(hasMore) {
             try {
                 const options = { count, offset, include_personal_finance_category: true }; // Request detailed categories
                 console.log(`Workspaceing transactions offset=${offset} count=${count}`);
                 const transactionsResponse = await plaidClient.transactionsGet({ access_token: accessToken, start_date: startDate, end_date: endDate, options });
                 const fetched = transactionsResponse.data.transactions;
                 allTransactions = allTransactions.concat(fetched);
                 offset += fetched.length;
                 hasMore = offset < transactionsResponse.data.total_transactions;
                 console.log(`Workspaceed ${fetched.length}, Total so far: ${allTransactions.length}, Total Available: ${transactionsResponse.data.total_transactions}, Has More: ${hasMore}`);
             } catch (error: any) {
                 console.error(`API [/api/plaid/exchange-token] Plaid transactionsGet error (offset ${offset}) for item ${itemId}:`, error.response?.data || error.message);
                 hasMore = false; // Stop fetching on error
             }
        }
        console.log(`API [/api/plaid/exchange-token] Fetched ${allTransactions.length} initial transactions for item ${itemId}`);

        // 11. Insert/Update Transactions into Supabase 'plaid_transactions' table
        if (allTransactions.length > 0) {
            // Use the updated mapPlaidTransactionToDb function
            const transactionsToInsert = allTransactions.map(t => mapPlaidTransactionToDb(t, userId, itemId));
            console.log(`API [/api/plaid/exchange-token] Upserting ${transactionsToInsert.length} transactions for item ${itemId}`);
            // Upsert based on Plaid's transaction_id. Use ignoreDuplicates=true.
            const { error: transactionsUpsertError } = await supabase
                .from('plaid_transactions')
                .upsert(transactionsToInsert, { onConflict: 'transaction_id', ignoreDuplicates: true }); // Requires UNIQUE constraint on transaction_id

            if (transactionsUpsertError) {
                console.error(`API [/api/plaid/exchange-token] Supabase transactions upsert error for item ${itemId}:`, transactionsUpsertError);
                 if (transactionsUpsertError.message.includes('constraint matching the ON CONFLICT specification')) {
                      console.error(">>> Ensure a UNIQUE constraint exists on (transaction_id) in the 'plaid_transactions' table! <<<");
                 }
                // Log error, but usually don't fail the link process just for transactions
            }
        } else {
             console.log(`API [/api/plaid/exchange-token] No transactions found in period to insert for item ${itemId}`);
        }

        // 12. Update item status after successful initial sync
        await supabase
             .from('plaid_items')
             .update({
                 status: 'synced', // Mark as successfully synced initially
                 last_sync_completed_at: new Date().toISOString(),
                 last_sync_error: null,
             })
             .match({ user_id: userId, item_id: itemId });

        console.log(`API [/api/plaid/exchange-token] Successfully linked item ${itemId} and performed initial sync for user ${userId}.`);
        return NextResponse.json({ success: true, item_id: itemId });

    } catch (error: any) {
        console.error("API [/api/plaid/exchange-token] Unexpected error:", error);
        // Attempt to update item status to 'error' if possible before failing
        // (This requires knowing itemId if exchange failed early - might not be feasible)
        return NextResponse.json({ message: 'An unexpected server error occurred.' }, { status: 500 });
    }
}