import postgres from 'postgres';
// import "dotenv/config";
import { loadEnvConfig } from '@next/env';

// const sql = postgres(process.env.POSTGRES_URL!, { ssl: false });
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const sql = postgres(process.env.POSTGRES_URL!, { ssl: false });

async function test() {
  console.log("HERE TEST FN");
  try {
    const result = await sql`SELECT 1`;
    console.log('Success:', result);
  } catch (error) {
    console.error('Connection failed:', error);
  }
}

test();
