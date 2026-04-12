
require('dotenv').config();
const { Pool } = require('@neondatabase/serverless');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { PrismaClient } = require('@prisma/client');

const url = process.env.DATABASE_URL;

if (!url) {
  console.error(" DATABASE_URL está vazia!");
} else {
  console.log(" DATABASE_URL carregada com sucesso.");
}

const pool = new Pool({ connectionString: url });
const adapter = new PrismaNeon(pool);
const db = new PrismaClient({ adapter });

module.exports = { db };
