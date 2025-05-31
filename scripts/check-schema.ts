import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Get database URL from environment variables
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!databaseUrl) {
  console.error('Error: DATABASE_URL or POSTGRES_URL environment variable is not set');
  process.exit(1);
}

async function checkSchema() {
  console.log('Connecting to database...');
  
  // Create a connection pool
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  const client = await pool.connect();
  
  try {
    console.log('Checking database schema...');
    
    // Check if tables exist
    const tables = ['blog_views', 'blog_comments', 'blog_likes', '_migrations'];
    
    for (const table of tables) {
      const result = await client.query(
        'SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = \'public\' AND table_name = $1)',
        [table]
      );
      
      console.log(`Table ${table} exists:`, result.rows[0].exists);
      
      if (result.rows[0].exists) {
        // Get table columns
        const columns = await client.query(
          'SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1',
          [table]
        );
        
        console.log(`Columns in ${table}:`);
        console.table(columns.rows);
      }
    }
    
    // Check migration history
    try {
      const migrations = await client.query('SELECT * FROM _migrations ORDER BY id');
      console.log('\nApplied migrations:');
      console.table(migrations.rows);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching migration history:', errorMessage);
    }
    
  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkSchema().catch(console.error);
