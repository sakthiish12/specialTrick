import { Pool, PoolClient, QueryResult, QueryResultRow } from '@neondatabase/serverless';

// Create a connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL_UNPOOLED,
  ssl: {
    rejectUnauthorized: process.env.NODE_ENV === 'production' ? true : false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Helper function to execute queries
export async function query<T extends QueryResultRow = any>(
  text: string, 
  params?: any[],
  client?: PoolClient
): Promise<QueryResult<T>> {
  const shouldRelease = !client;
  const dbClient = client || await pool.connect();
  
  try {
    return await dbClient.query<T>(text, params);
  } catch (error) {
    console.error('Database query error:', { query: text, error });
    throw error;
  } finally {
    if (shouldRelease && dbClient) {
      dbClient.release();
    }
  }
}

// Helper function to get a single row
export async function getOne<T extends QueryResultRow = any>(
  text: string, 
  params?: any[],
  client?: PoolClient
): Promise<T | null> {
  const result = await query<T>(text, params, client);
  return result.rows[0] || null;
}

// Helper function to get multiple rows
export async function getMany<T extends QueryResultRow = any>(
  text: string, 
  params?: any[],
  client?: PoolClient
): Promise<T[]> {
  const result = await query<T>(text, params, client);
  return result.rows;
}

// Helper function to execute a transaction
export async function transaction<T>(
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

// Health check function
export async function checkConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}
