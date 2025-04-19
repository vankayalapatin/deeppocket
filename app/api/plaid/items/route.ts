// app/api/plaid/items/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// Interface for the final structure expected by the frontend dropdown
interface LinkedInstitutionInfo {
     item_id: string; // Plaid item ID
     institution: {
        institution_id: string | null; // Changed to allow null
        name: string | null; // Changed to allow null
        logo: string | null; // Base64 logo string or null
     };
}

export async function GET() {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
        // 1. Authenticate User
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) {
            console.error("API [/api/plaid/items] Auth Error:", sessionError?.message || "No session");
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }
        const userId = session.user.id;
        console.log(`API [/api/plaid/items] User: ${userId}`);

        // 2. Fetch linked items directly from Supabase 'plaid_items' table
        const { data: items, error: dbError } = await supabase
            .from('plaid_items')
            .select('item_id, institution_id, institution_name, institution_logo_base64') // Select logo
            .eq('user_id', userId)
            .order('institution_name', { ascending: true }); // Order for display

        if (dbError) {
            console.error(`API [/api/plaid/items] DB Error for user ${userId}:`, dbError);
            return NextResponse.json({ message: 'Database error fetching linked items.' }, { status: 500 });
        }

        if (!items || items.length === 0) {
            console.log(`API [/api/plaid/items] No Plaid items found in DB for user ${userId}.`);
            return NextResponse.json({ linkedInstitutions: [] }, { status: 200 });
        }

        // 3. Format the data for the frontend component
        const linkedInstitutions: LinkedInstitutionInfo[] = items.map(item => ({
            item_id: item.item_id,
            institution: {
                institution_id: item.institution_id, // Use value from DB (could be null)
                name: item.institution_name,       // Use value from DB (could be null)
                logo: item.institution_logo_base64 // Use logo from DB (could be null)
            }
        }));

        console.log(`API [/api/plaid/items] Returning ${linkedInstitutions.length} linked institutions from DB for user ${userId}.`);
        return NextResponse.json({ linkedInstitutions });

    } catch (error: any) {
        console.error('API [/api/plaid/items] Unexpected Server Error:', error);
        return NextResponse.json({ message: 'An unexpected server error occurred.' }, { status: 500 });
    }
}