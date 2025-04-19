// app/api/plaid/transactions/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import dayjs from 'dayjs';
import { Transaction, Location, PaymentMeta, PersonalFinanceCategory } from 'plaid';

export const dynamic = 'force-dynamic';

// --- Alternative Query Param Helpers ---
// Explicitly handles null case first for getQueryParam
const getQueryParam = (req: NextRequest, param: string, defaultValue: string): string => {
    const value = req.nextUrl.searchParams.get(param);
    if (value === null) {
        return defaultValue;
    }
    return value; // Value is guaranteed string here
};

// Explicitly handles null and parsing failure for getQueryParamAsInt
const getQueryParamAsInt = (req: NextRequest, param: string, defaultValue: number): number => {
    const value = req.nextUrl.searchParams.get(param);
    if (value === null) {
        return defaultValue; // Return default if param missing
    }
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
        return defaultValue; // Return default if parsing fails
    }
    return parsed; // Return parsed number
};

// getOptionalQueryParam remains simple
const getOptionalQueryParam = (req: NextRequest, param: string): string | null => {
     return req.nextUrl.searchParams.get(param);
};
// --- End Alternative Helpers ---

// --- DB Row Interface ---
// (Adjust based on your actual Supabase table columns selected)
interface DbTransaction {
    id: number;
    user_id: string;
    item_id: string;
    account_id: string; // Plaid's account ID (stored as text)
    transaction_id: string;
    category_primary: string | null;
    category_detailed: string | null;
    name: string | null;
    merchant_name: string | null;
    amount: number | null;
    currency: string | null;
    date: string | null;
    pending: boolean | null;
    payment_channel: string | null;
    is_removed: boolean | null;
    // Add other selected columns if any
}


export async function GET(request: NextRequest) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
        // 1. Authentication
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) { /* ... error handling ... */ return NextResponse.json({ message: 'Not authenticated' }, { status: 401 }); }
        const userId = session.user.id;

        // 2. Get Query Parameters using corrected helpers
        const defaultEndDate = dayjs().format('YYYY-MM-DD');
        const defaultStartDate = dayjs().subtract(30, 'days').format('YYYY-MM-DD');
        const startDate = getQueryParam(request, 'startDate', defaultStartDate);
        const endDate = getQueryParam(request, 'endDate', defaultEndDate);
        const count = getQueryParamAsInt(request, 'count', 25);
        const offset = getQueryParamAsInt(request, 'offset', 0);
        const accountIdFilter = getOptionalQueryParam(request, 'accountId'); // Plaid Account ID
        const itemIdFilter = getOptionalQueryParam(request, 'itemId'); // Plaid Item ID

        // Basic date validation
        if (!dayjs(startDate).isValid() || !dayjs(endDate).isValid()) {
             return NextResponse.json({ message: 'Invalid date format. Use YYYY-MM-DD.' }, { status: 400 });
        }
        console.log(`API [/api/plaid/transactions] User: ${userId}, Start: ${startDate}, End: ${endDate}, Count: ${count}, Offset: ${offset}`);


        // 3. Build Supabase Query
        let query = supabase.from('plaid_transactions').select('*', { count: 'exact' })
           .eq('user_id', userId)
           .eq('is_removed', false) // Exclude removed transactions
           .gte('date', startDate)
           .lte('date', endDate)
           .order('date', { ascending: false })
           .range(offset, offset + count - 1);
        // Apply optional filters
        if (accountIdFilter) { query = query.eq('account_id', accountIdFilter); } // Use account_id (Plaid's ID)
        if (itemIdFilter) { query = query.eq('item_id', itemIdFilter); }

        // 4. Execute Query
        const { data: dbTransactions, error: dbError, count: total_transactions } = await query.returns<DbTransaction[]>(); // Use DB type
        if (dbError) { /* ... error handling ... */ return NextResponse.json({ message: 'DB error...' }, { status: 500 }); }


        // 5. Format results: Map DbTransaction to Plaid Transaction explicitly
        const transactions: Transaction[] = dbTransactions?.map((t: DbTransaction): Transaction => {
            const defaultLocation: Location = { address: null, city: null, region: null, postal_code: null, country: null, lat: null, lon: null, store_number: null };
            const defaultPaymentMeta: PaymentMeta = { by_order_of: null, payee: null, payer: null, payment_method: null, payment_processor: null, ppd_id: null, reason: null, reference_number: null };
            // Reconstruct personal_finance_category object
            const personalFinanceCategory: PersonalFinanceCategory | null = (t.category_primary && t.category_detailed) ? {
                primary: t.category_primary,
                detailed: t.category_detailed,
                confidence_level: null // Not stored
            } : null;

            // Build the Transaction object property by property
            const formattedTransaction: Transaction = {
                account_id: t.account_id ?? '', // Use DB value
                account_owner: null,
                amount: t.amount ?? 0,
                iso_currency_code: t.currency ?? null,
                unofficial_currency_code: null, // Required, set to null
                category: t.category_primary ? [t.category_primary, t.category_detailed].filter(Boolean) as string[] : [], // Use stored categories
                category_id: null,
                check_number: null,
                counterparties: [],
                date: t.date ?? '',
                datetime: null,
                authorized_date: null,
                authorized_datetime: null,
                location: defaultLocation,
                logo_url: null,
                merchant_entity_id: null,
                merchant_name: t.merchant_name ?? null,
                name: t.name ?? '',
                payment_channel: t.payment_channel as Transaction['payment_channel'] ?? 'other', // Use DB value or default
                payment_meta: defaultPaymentMeta,
                pending: t.pending ?? false,
                pending_transaction_id: null,
                personal_finance_category: personalFinanceCategory, // Use reconstructed object
                personal_finance_category_icon_url: undefined, // Required, set to undefined
                transaction_code: null,
                transaction_id: t.transaction_id ?? '', // Use DB value
                transaction_type: undefined, // Deprecated, set to undefined
                website: null
            };
            return formattedTransaction;
        }) || [];


        console.log(`API [/api/plaid/transactions] Returning ${transactions.length} of ${total_transactions} transactions from DB for user ${userId}.`);
        return NextResponse.json({ transactions, total_transactions: total_transactions ?? 0 });

    } catch (error: any) {
         console.error('API [/api/plaid/transactions] Unexpected Server Error:', error);
         return NextResponse.json({ message: 'An unexpected server error occurred.' }, { status: 500 });
    }
}