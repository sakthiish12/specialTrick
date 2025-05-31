import { Pool, QueryResult, QueryResultRow } from '@neondatabase/serverless';

// Create a connection pool
export const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Helper function to execute queries
export async function query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const client = await pool.connect();
  try {
    return await client.query<T>(text, params);
  } finally {
    client.release();
  }
}

// Helper function to get a single row
export async function getOne<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<T | null> {
  const result = await query<T>(text, params);
  return result.rows[0] || null;
}

// Helper function to get multiple rows
export async function getMany<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<T[]> {
  const result = await query<T>(text, params);
  return result.rows;
}

// Helper function to execute a transaction
export async function transaction(queries: { text: string; params?: any[] }[]) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const results = [];
    
    for (const q of queries) {
      const result = await client.query(q.text, q.params);
      results.push(result);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
