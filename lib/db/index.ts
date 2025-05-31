import { Pool, PoolClient, QueryResult, QueryResultRow } from '@neondatabase/serverless';
import { pool } from './neon';

export * from './neon';

/**
 * Execute a database query with error handling and logging
 */
export async function dbQuery<T extends QueryResultRow = any>(
  text: string,
  params: any[] = [],
  client?: PoolClient
): Promise<QueryResult<T>> {
  const dbClient = client || await pool.connect();
  const shouldRelease = !client;
  
  try {
    const start = Date.now();
    const result = await dbClient.query<T>(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries
    if (duration > 2000) { // 2 seconds
      console.warn(`Slow query (${duration}ms):`, { query: text, params });
    }
    
    return result;
  } catch (error) {
    console.error('Database query error:', { query: text, params, error });
    throw new Error(`Database error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    if (shouldRelease && dbClient) {
      dbClient.release();
    }
  }
}

/**
 * Get a single row from the database
 */
export async function dbOne<T extends QueryResultRow = any>(
  text: string,
  params: any[] = [],
  client?: PoolClient
): Promise<T | null> {
  const result = await dbQuery<T>(text, params, client);
  return result.rows[0] || null;
}

/**
 * Get multiple rows from the database
 */
export async function dbMany<T extends QueryResultRow = any>(
  text: string,
  params: any[] = [],
  client?: PoolClient
): Promise<T[]> {
  const result = await dbQuery<T>(text, params, client);
  return result.rows;
}

/**
 * Execute a transaction with automatic commit/rollback
 */
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(console.error);
    console.error('Transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Check if the database connection is healthy
 */
export async function checkDbConnection(): Promise<boolean> {
  try {
    await dbQuery('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

// Export a default instance for easier imports
export default {
  query: dbQuery,
  one: dbOne,
  many: dbMany,
  transaction: withTransaction,
  checkConnection: checkDbConnection,
  // Re-export pool for advanced use cases
  pool: pool,
};
