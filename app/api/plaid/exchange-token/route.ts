// app/api/plaid/exchange-token/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid'; // Your configured Plaid client
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { encrypt } from '@/lib/encryption'; // Import the encrypt function

// --- Environment Variable Check ---
// It's good practice to ensure critical environment variables are loaded.
// This check runs when the module loads.
if (!process.env.ENCRYPTION_KEY) {
  console.error("FATAL SERVER ERROR: ENCRYPTION_KEY environment variable is not set.");
  // Depending on your deployment, you might want to throw an error here
  // during build or startup if possible, but for a running server,
  // logging is crucial. The request handler will also check.
}

export async function POST(request: NextRequest) {
  // --- Check Encryption Key Existence Per Request ---
  // Crucial runtime check in case the server started despite the initial log.
  if (!process.env.ENCRYPTION_KEY) {
     console.error("API Error: ENCRYPTION_KEY environment variable not set during request.");
     // Avoid leaking specifics, return a generic server error.
     return NextResponse.json({ error: 'Internal server configuration error.' }, { status: 500 });
  }

  // --- Request Body Parsing and Validation ---
  let public_token: string | undefined;
  let institution_id: string | undefined;
  let institution_name: string | undefined;

  try {
    const body = await request.json();
    public_token = body.public_token;
    institution_id = body.institution_id;
    institution_name = body.institution_name;

    if (!public_token || !institution_id || !institution_name) {
      return NextResponse.json(
        { error: 'Missing required fields: public_token, institution_id, and institution_name are required.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error parsing request body:', error);
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  // --- User Authentication ---
  const supabase = createRouteHandlerClient({ cookies });
  let userId: string;
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
       console.error('Authentication error:', authError);
       return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    userId = user.id;
  } catch (error) {
     console.error('Supabase auth error:', error);
     return NextResponse.json({ error: 'Authentication failed.' }, { status: 500 });
  }


  // --- Plaid Token Exchange and Encryption ---
  try {
    // Exchange public token for access token and item ID
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: public_token,
    });
    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Encrypt the access token before storing
    const encryptedAccessToken = encrypt(accessToken);

    if (!encryptedAccessToken) {
      // Handle encryption failure (encrypt function should log details)
      console.error(`Encryption failed for item_id: ${itemId}.`);
      return NextResponse.json({ error: 'Failed to secure account credentials.' }, { status: 500 });
    }

    // --- Database Insertion ---
    const { error: insertError } = await supabase
      .from('plaid_items')
      .insert({
        user_id: userId,
        item_id: itemId,
        access_token: encryptedAccessToken, // Store the encrypted token
        institution_id: institution_id,
        institution_name: institution_name,
        status: 'good' // Set initial status (consider fetching accounts/status later)
      });

    if (insertError) {
      console.error('Error storing Plaid item in Supabase:', insertError);
      // Check for specific errors if needed, e.g., unique constraint violations
      // if (!insertError.message.includes('duplicate key value violates unique constraint')) { ... }
      return NextResponse.json(
        { error: `Failed to save account connection: ${insertError.message}` },
        { status: 500 } // Database errors are server-side issues
      );
    }

    // --- Success Response ---
    console.log(`Successfully stored encrypted Plaid item ${itemId} for user ${userId}`);
    return NextResponse.json({
      success: true,
      institution: institution_name, // Return institution name for confirmation
      item_id: itemId // Optionally return item_id if useful for the frontend
    });

  } catch (error: any) {
    // --- Generic Error Handling (Plaid API, Network, etc.) ---
    console.error('Error during Plaid token exchange or DB insertion:', error);

    // Extract Plaid specific error details if available
    const plaidErrorCode = error.response?.data?.error_code;
    const plaidErrorMessage = error.response?.data?.error_message;
    const plaidStatus = error.response?.status;

    const errorMessage = plaidErrorMessage || error.message || 'An unexpected error occurred during account connection.';
    const errorCode = plaidErrorCode; // Can be undefined

    return NextResponse.json(
      { error: errorMessage, errorCode: errorCode },
      { status: plaidStatus || 500 } // Use Plaid's status code or default to 500
    );
  }
}