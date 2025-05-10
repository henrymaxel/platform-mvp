//app/lib/db.ts
import postgres from 'postgres';
import type { User } from '@/app/lib/definitions';
// Create a connection
const sql = postgres(process.env.POSTGRES_URL!, { ssl: false });

export async function query(text: string, params?: any[]) {
  try {
    // Convert parameterized query format from pg-style ($1, $2) to postgres-style
    let queryText = text;
    if (params && params.length > 0) {
      // Replace $1, $2, etc. with actual values
      params.forEach((param, index) => {
        queryText = queryText.replace(`$${index + 1}`, sql(param as any));
      });
      
      // Use sql.unsafe for dynamic queries with parameters
      const result = await sql.unsafe(queryText);
      return { rows: result, rowCount: result.length };
    } else {
      // Use template literal for queries without parameters
      const result = await sql.unsafe(text);
      return { rows: result, rowCount: result.length };
    }
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Alternative approach using postgres library's native parameter handling
export async function queryPostgres(strings: TemplateStringsArray, ...values: any[]) {
  try {
    const result = await sql(strings, ...values);
    return { rows: result, rowCount: result.length };
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

export async function getUser(email: string): Promise<User | null> {
  try {
    // Using postgres library's template literal syntax
    const result = await sql<User[]>`
      SELECT * FROM users WHERE email = ${email}
    `;
    
    if (result.length === 0) {
      return null;
    }
    
    return result[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}

// For more complex queries or transactions
export async function transaction<T>(callback: (sql: typeof postgres.TransactionSql) => Promise<T>): Promise<T> {
  return sql.begin(callback);
}

// Helper to format results similar to pg library
export function formatResult(result: any[]) {
  return {
    rows: result,
    rowCount: result.length,
  };
}

// Export the sql instance for direct use when needed
export { sql };