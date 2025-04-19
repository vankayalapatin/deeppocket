// app/api/plaid/items/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { plaidClient } from '@/lib/plaid';
import { Institution, CountryCode } from 'plaid';

export const dynamic = 'force-dynamic';

const getEnvVar = (varName: string, defaultValue?: string): string => {
    const value = process.env[varName];
    if (!value && defaultValue === undefined) {
        throw new Error(`${varName} environment variable is not set.`);
    }
    return value || defaultValue!;
};

// REMOVED Unused Interface: PlaidItemInfo

// This interface IS used for the final response structure
interface LinkedInstitutionInfo {
     item_id: string;
     institution: Institution;
}


export async function GET() {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
        // 1. Authenticate User
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }
        const userId = session.user.id;

        // 2. Fetch all linked item IDs and institution IDs from DB
        // TypeScript infers the type of 'items' from the select query
        const { data: items, error: dbError } = await supabase
            .from('plaid_items')
            .select('item_id, institution_id')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (dbError) {
            console.error(`API [/api/plaid/items] DB Error for user ${userId}:`, dbError);
            return NextResponse.json({ message: 'Database error fetching linked items.' }, { status: 500 });
        }

        if (!items || items.length === 0) {
            console.log(`API [/api/plaid/items] No Plaid items found for user ${userId}.`);
            return NextResponse.json({ linkedInstitutions: [] }, { status: 200 });
        }

        // 3. Fetch Institution Details from Plaid
        const uniqueInstitutionIds = [...new Set(items.map(item => item.institution_id))];
        const countryCodes = getEnvVar('PLAID_COUNTRY_CODES', 'US').split(',') as CountryCode[];

        // ... (rest of the institution fetching logic remains the same) ...
         const institutionPromises = uniqueInstitutionIds.map(id =>
             plaidClient.institutionsGetById({
                 institution_id: id,
                 country_codes: countryCodes,
                 options: { include_optional_metadata: true }
             }).then(response => ({ id, data: response.data.institution }))
               .catch(error => {
                  console.error(`API [/api/plaid/items] Failed to fetch institution ${id}:`, error.response?.data || error.message);
                  return { id, data: null };
               })
         );
         const institutionResults = await Promise.all(institutionPromises);
         const institutionMap = new Map(institutionResults.map(res => [res.id, res.data]));


        // 4. Map DB items to include full institution details
        const linkedInstitutions: LinkedInstitutionInfo[] = items
            .map(item => { // 'item' has inferred type { item_id: string, institution_id: string }
                const institution = institutionMap.get(item.institution_id);
                if (institution) {
                    return {
                        item_id: item.item_id,
                        institution: institution,
                    };
                }
                return null;
            })
            .filter((item): item is LinkedInstitutionInfo => item !== null);


        console.log(`API [/api/plaid/items] Returning ${linkedInstitutions.length} linked institutions for user ${userId}.`);
        return NextResponse.json({ linkedInstitutions });

    } catch (error: any) {
        console.error('API [/api/plaid/items] Unexpected Server Error:', error);
        return NextResponse.json({ message: 'An unexpected server error occurred.' }, { status: 500 });
    }
}