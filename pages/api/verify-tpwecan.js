import { createClient } from '@supabase/supabase-js';

// Initialize the connection to your OLD tpwecan database
const tpwecanUrl = process.env.TPWECAN_SUPABASE_URL;
const tpwecanKey = process.env.TPWECAN_SUPABASE_SERVICE_KEY; // CRITICAL: Must use SERVICE_KEY to bypass RLS

if (!tpwecanUrl || !tpwecanKey) {
  console.error("Missing Supabase keys in .env.local");
}

const supabase = createClient(tpwecanUrl, tpwecanKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tpwecan_id } = req.body;

  if (!tpwecan_id) {
    return res.status(400).json({ error: 'TPwecan ID is required' });
  }

  try {
    // Clean the input: remove spaces and make it uppercase to match the DB pattern
    const cleanId = tpwecan_id.trim().toUpperCase();

    // 1. Check the 'profiles' table in the 'referral_code' column
    const { data: user, error: userError } = await supabase
      .from('profiles') 
      .select('full_name, phone, phone_number') 
      .eq('referral_code', cleanId) 
      .single();

    if (userError || !user) {
      console.error("Supabase Query Error:", userError);
      return res.status(404).json({ error: 'ID not found. Please check your ID and try again.' });
    }

    // 2. Send the data back to the frontend
    // Note: Your JSON showed 'phone' has the number, 'phone_number' was null.
    return res.status(200).json({ 
      success: true, 
      user: {
        full_name: user.full_name,
        phone_number: user.phone || user.phone_number, // Uses 'phone' as fallback
        email: 'Verified via TPwecan' // Email wasn't in the JSON, so we handle it gracefully
      } 
    });

  } catch (error) {
    console.error("API Catch Error:", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}