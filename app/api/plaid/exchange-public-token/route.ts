import { NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { CountryCode } from 'plaid';

export async function POST(request: Request) {
  try {
    const { public_token } = await request.json();
    
    if (!public_token) {
      return NextResponse.json(
        { error: 'Missing public token' },
        { status: 400 }
      );
    }

    // Get user from Supabase auth
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Exchange public token for access token
    const tokenResponse = await plaidClient.itemPublicTokenExchange({
      public_token: public_token,
    });

    const access_token = tokenResponse.data.access_token;
    const item_id = tokenResponse.data.item_id;

    // Store the access token in your database
    // Here we're using Supabase to store the tokens
    const { error } = await supabase
      .from('plaid_items')
      .insert({
        user_id: user.id,
        item_id: item_id,
        access_token: access_token,
        status: 'active'
      });

    if (error) {
      console.error('Error storing access token:', error);
      return NextResponse.json(
        { error: 'Failed to store access token' },
        { status: 500 }
      );
    }

    // Get institution information
    const itemResponse = await plaidClient.itemGet({ access_token });
    const institution_id = itemResponse.data.item.institution_id;

    let institutionName = 'Financial Institution';
    
    if (institution_id) {
      try {
        const institutionResponse = await plaidClient.institutionsGetById({
          institution_id,
          country_codes: [CountryCode.Us],
        });
        institutionName = institutionResponse.data.institution.name;
      } catch (error) {
        console.error('Error getting institution info:', error);
      }
    }

    // Return success without exposing the access token
    return NextResponse.json({
      success: true,
      institution: institutionName,
    });
  } catch (error) {
    console.error('Error exchanging token:', error);
    return NextResponse.json(
      { error: 'Failed to exchange token' },
      { status: 500 }
    );
  }
}