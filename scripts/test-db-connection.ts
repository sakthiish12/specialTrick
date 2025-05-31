// Test script to verify Supabase connection
// Run with: npx tsx scripts/test-db-connection.ts

import { supabaseAdmin } from '../lib/supabase/server';

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabaseAdmin.from('documents').select('count').single();
    
    if (error) {
      console.error('Error connecting to Supabase:', error.message);
      process.exit(1);
    }

    console.log('Successfully connected to Supabase!');
    console.log('Current document count:', data.count);

    // Test vector extension
    const { data: vectorTest, error: vectorError } = await supabaseAdmin.rpc('match_documents', {
      query_embedding: Array(1536).fill(0),
      match_count: 1,
      match_threshold: 0
    });

    if (vectorError) {
      console.error('Error testing vector extension:', vectorError.message);
      process.exit(1);
    }

    console.log('Vector extension is working correctly!');
    process.exit(0);
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

testConnection(); 