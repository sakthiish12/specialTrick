import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Get database URL from environment variables
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!databaseUrl) {
  console.error('Error: DATABASE_URL or POSTGRES_URL environment variable is not set');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
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
    // Start a transaction
    await client.query('BEGIN');
    
    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        run_on TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    // Get all migration files
    const migrationFiles = [
      '001_initial_schema.sql',
      // Add more migration files here as needed
    ];

    // Get already run migrations
    const { rows: runMigrations } = await client.query<{ name: string }>(
      'SELECT name FROM _migrations ORDER BY id'
    );
    const runMigrationNames = new Set(runMigrations.map(m => m.name));

    // Run new migrations
    for (const migrationFile of migrationFiles) {
      if (!runMigrationNames.has(migrationFile)) {
        console.log(`Running migration: ${migrationFile}`);
        
        // Read the migration file
        const migrationPath = join(
          __dirname,
          '..',
          'lib',
          'db',
          'migrations',
          migrationFile
        );
        
        const migrationSQL = readFileSync(migrationPath, 'utf8');
        
        // Run the migration
        await client.query(migrationSQL);
        
        // Record the migration
        await client.query(
          'INSERT INTO _migrations (name) VALUES ($1)',
          [migrationFile]
        );
        
        console.log(`Migration ${migrationFile} completed successfully`);
      } else {
        console.log(`Skipping already run migration: ${migrationFile}`);
      }
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    console.log('All migrations completed successfully');
  } catch (error) {
    // Rollback the transaction in case of error
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch(console.error);
