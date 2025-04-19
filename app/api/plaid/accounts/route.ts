// app/api/plaid/accounts/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { AccountBase, Institution } from 'plaid'; // Use Plaid types for shaping output

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
        // 1. Authenticate User
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) {
            console.error("API [/api/plaid/accounts] Auth Error:", sessionError?.message || "No session");
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }
        const userId = session.user.id;

        // 2. Get item_id from Query Parameter
        const itemId = request.nextUrl.searchParams.get('itemId');
        if (!itemId) {
            console.warn("API [/api/plaid/accounts] Missing itemId query parameter");
            return NextResponse.json({ message: 'Missing required query parameter: itemId' }, { status: 400 });
        }
        console.log(`API [/api/plaid/accounts] User: ${userId}, Item: ${itemId}`);

        // 3. Fetch the Institution details associated with this itemId (from plaid_items)
        const { data: itemInfo, error: itemInfoError } = await supabase
            .from('plaid_items')
            .select('institution_id, institution_name, institution_logo_base64') // Select logo
            .eq('user_id', userId)
            .eq('item_id', itemId)
            .single();

        if (itemInfoError || !itemInfo) {
             console.error(`API [/api/plaid/accounts] Item info not found for user ${userId}, item ${itemId}:`, itemInfoError);
             const status = itemInfoError?.code === 'PGRST116' ? 404 : 500;
             return NextResponse.json({ message: 'Item info not found.' }, { status });
        }

        // 4. Fetch Accounts from DB table 'plaid_accounts'
        const { data: dbAccounts, error: dbError } = await supabase
            .from('plaid_accounts')
            .select('*') // Select all needed columns
            .eq('user_id', userId)
            .eq('item_id', itemId); // Filter by item_id

        if (dbError) {
            console.error(`API [/api/plaid/accounts] DB Error fetching accounts for user ${userId}, item ${itemId}:`, dbError);
            return NextResponse.json({ message: 'Database error fetching accounts.' }, { status: 500 });
        }

        // 5. Format DB account data to match Plaid's AccountBase structure
        const accounts: AccountBase[] = dbAccounts?.map((acc: any) => ({
             account_id: acc.account_id,
             balances: {
                 current: acc.current_balance ?? null,
                 available: acc.available_balance ?? null,
                 limit: acc.limit ?? null,
                 iso_currency_code: acc.currency ?? null,
                 unofficial_currency_code: null,
             },
             mask: acc.mask ?? null,
             name: acc.name ?? '',
             official_name: acc.official_name ?? null,
             subtype: acc.subtype ?? null,
             type: acc.type as any ?? null,
             verification_status: undefined,
             persistent_account_id: undefined,
         })) || [];

         // Construct the institution object including logo
         // Use Partial<Institution> because we don't have all fields from Plaid
         const institution: Partial<Institution> = {
             institution_id: itemInfo.institution_id, // Use ID from DB
             name: itemInfo.institution_name,         // Use name from DB
             logo: itemInfo.institution_logo_base64,  // Use logo from DB
             // Other fields like url, primary_color are not available here
         };

        console.log(`API [/api/plaid/accounts] Returning ${accounts.length} accounts from DB for item ${itemId}.`);
        return NextResponse.json({ accounts, institution });

    } catch (error: any) {
        console.error('API [/api/plaid/accounts] Unexpected Server Error:', error);
        return NextResponse.json({ message: 'An unexpected server error occurred.' }, { status: 500 });
    }
}