// app/api/plaid/create-link-token/route.ts
import { NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid'; // Ensure this path is correct
import { CountryCode, Products } from 'plaid';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic'; // Ensure it runs dynamically

export async function POST() {
  console.log("API [/api/plaid/create-link-token] Received request."); // Log start
  try {
    // 1. Get user from Supabase auth
    const cookieStore = cookies(); // Get cookies instance
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore }); // Pass factory function
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Check specifically for authError as well as user nullability
    if (authError || !user) {
      console.error("API [/api/plaid/create-link-token] Auth Error:", authError?.message || "User not found");
      return NextResponse.json(
        { error: 'User not authenticated', details: authError?.message },
        { status: 401 }
      );
    }
     console.log(`API [/api/plaid/create-link-token] Authenticated User: ${user.id}`);

    // 2. Prepare Plaid Link Token Request config
    // Fetch these from environment variables or define defaults
    const products = (process.env.PLAID_PRODUCTS || 'transactions').split(',') as Products[];
    const countryCodes = (process.env.PLAID_COUNTRY_CODES || 'US').split(',') as CountryCode[];

    const request = {
        user: {
            client_user_id: user.id, // REQUIRED: Associate token with your user ID
        },
        client_name: process.env.PLAID_CLIENT_NAME || 'DeepPocket App', // Use ENV Var or default
        products: products,
        country_codes: countryCodes,
        language: 'en',
        // webhook: process.env.PLAID_WEBHOOK_URL, // Recommended for transaction updates etc.
        // redirect_uri: process.env.PLAID_REDIRECT_URI, // Needed for OAuth flow if used
    };

    // 3. Create a link token with Plaid
    console.log("API [/api/plaid/create-link-token] Creating Plaid link token with request:", request);
    const createTokenResponse = await plaidClient.linkTokenCreate(request);
    console.log("API [/api/plaid/create-link-token] Plaid link token created successfully.");


    // 4. Return the link_token with the CORRECT key (snake_case)
    return NextResponse.json({
      link_token: createTokenResponse.data.link_token // *** FIX: Use snake_case key ***
    });

  } catch (error: any) {
    // Log detailed error information
    console.error('API [/api/plaid/create-link-token] Error creating link token:', error.response?.data || error.message || error);
    return NextResponse.json(
      { error: 'Failed to create link token', details: error.response?.data || error.message },
      { status: 500 }
    );
  }
}