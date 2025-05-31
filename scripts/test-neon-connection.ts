// Test script to verify Neon database connection
// Run with: npx tsx scripts/test-neon-connection.ts

import { checkConnection, query } from '../lib/db';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const isConnected = await checkConnection();
    
    if (!isConnected) {
      console.error('❌ Failed to connect to the database');
      process.exit(1);
    }
    
    console.log('✅ Successfully connected to the database!');
    
    // Test a simple query
    console.log('\nTesting a simple query...');
    const result = await query('SELECT version() as version');
    console.log('✅ Database version:', result.rows[0].version);
    
    // Test creating a test table (if it doesn't exist)
    console.log('\nTesting table creation...');
    await query(`
      CREATE TABLE IF NOT EXISTS test_connection (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`
    );
    
    // Test inserting data
    console.log('✅ Test table created/verified');
    console.log('\nTesting data insertion...');
    const insertResult = await query(
      'INSERT INTO test_connection (message) VALUES ($1) RETURNING id',
      ['Test connection from script']
    );
    
    console.log(`✅ Inserted test record with ID: ${insertResult.rows[0].id}`);
    
    // Test reading data
    console.log('\nTesting data retrieval...');
    const selectResult = await query(
      'SELECT * FROM test_connection ORDER BY created_at DESC LIMIT 5'
    );
    
    console.log('\nRecent test records:');
    selectResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. [${row.id}] ${row.message} (${row.created_at})`);
    });
    
    console.log('\n✅ All tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  }
}

testConnection();
