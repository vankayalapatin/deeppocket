// app/api/plaid/accounts/route.ts
import { NextResponse, NextRequest } from 'next/server'; // Import NextRequest
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { plaidClient } from '@/lib/plaid';
import { decrypt } from '@/lib/encryption';
import { AccountBase, Institution, CountryCode } from 'plaid';

export const dynamic = 'force-dynamic';

const getEnvVar = (varName: string, defaultValue?: string): string => { /* ... same as above ... */
    const value = process.env[varName];
    if (!value && defaultValue === undefined) {
        throw new Error(`${varName} environment variable is not set.`);
    }
    return value || defaultValue!;
};


// GET function now accepts request object to read query params
export async function GET(request: NextRequest) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
        // 1. Authenticate User
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }
        const userId = session.user.id;

        // 2. Get item_id from Query Parameter
        const itemId = request.nextUrl.searchParams.get('itemId');
        if (!itemId) {
            return NextResponse.json({ message: 'Missing required query parameter: itemId' }, { status: 400 });
        }

        // 3. Retrieve Token and Institution ID for the SPECIFIC item_id and user_id
        // Make sure item_id column exists and is selected
        const { data: itemData, error: dbError } = await supabase
            .from('plaid_items')
            .select('access_token, institution_id') // Use correct field name 'access_token'
            .eq('user_id', userId)
            .eq('item_id', itemId) // Filter by specific item ID
            .single(); // Expect exactly one item for this user/item combo

        if (dbError || !itemData) {
            console.error(`API [/api/plaid/accounts] DB Error or item not found for user ${userId}, item ${itemId}:`, dbError);
            const status = dbError?.code === 'PGRST116' ? 404 : 500; // PGRST116: 'No rows found'
            return NextResponse.json({ message: status === 404 ? 'Item not found for this user.' : 'Database error.' }, { status });
        }
         if (!itemData.access_token || !itemData.institution_id) {
             console.error(`API [/api/plaid/accounts] Incomplete data for user ${userId}, item ${itemId}.`);
             return NextResponse.json({ message: 'Incomplete item data in database.' }, { status: 500 });
         }
        const institutionId = itemData.institution_id;

        // 4. Decrypt Access Token
        const accessToken = decrypt(itemData.access_token);
        if (!accessToken) {
             console.error(`API [/api/plaid/accounts] Decryption Failed for user ${userId}, item ${itemId}.`);
            return NextResponse.json({ message: 'Failed to process credentials.' }, { status: 500 });
        }

        // 5. Fetch Accounts & Institution (parallel)
        // ... (Fetch logic using accessToken and institutionId remains the same as previous version) ...
         let accounts: AccountBase[] = [];
         let institution: Institution | null = null;
         const accountsPromise = plaidClient.accountsGet({ access_token: accessToken });
         const countryCodes = getEnvVar('PLAID_COUNTRY_CODES', 'US').split(',') as CountryCode[];
         const institutionPromise = plaidClient.institutionsGetById({
              institution_id: institutionId,
              country_codes: countryCodes,
              options: { include_optional_metadata: true }
          });

         try {
             console.log(`API [/api/plaid/accounts] Fetching accounts/institution for user ${userId}, item ${itemId}...`);
             const [accountsResponse, institutionResponse] = await Promise.all([
                 accountsPromise,
                 institutionPromise
             ]);
             accounts = accountsResponse.data.accounts;
             institution = institutionResponse.data.institution;
             console.log(`API [/api/plaid/accounts] Fetched ${accounts.length} accounts for item ${itemId}.`);
         } catch (plaidError: any) {
             // ... (Error handling for Promise.all remains the same) ...
             console.error(`API [/api/plaid/accounts] Plaid Error (Accounts/Institution) for user ${userId}, item ${itemId}:`, plaidError.response?.data || plaidError.message);
             const status = plaidError.response?.status || 500;
             const message = `Failed to fetch data for item ${itemId}: ${plaidError.response?.data?.error_message || plaidError.message}`;
             return NextResponse.json({ message }, { status });
         }


        // 6. Return Data for the specific item
        return NextResponse.json({ accounts, institution });

    } catch (error: any) {
        console.error('API [/api/plaid/accounts] Unexpected Server Error:', error);
        return NextResponse.json({ message: 'An unexpected server error occurred.' }, { status: 500 });
    }
}