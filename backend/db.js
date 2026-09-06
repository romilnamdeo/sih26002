const { Pool } = require('pg');
require('dotenv').config();

const dbSchema = process.env.DB_SCHEMA || 'ner_routeguard';

// Configure pool using DATABASE_URL or individual credentials
const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'sih26002_clean',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
    };

// Ensure startup command options set search_path to ner_routeguard, public
poolConfig.options = `-c search_path=${dbSchema},public`;

const pool = new Pool(poolConfig);

// Test connection and PostGIS on startup
pool.query('SELECT current_database(), current_schema(), PostGIS_Version()', (err, res) => {
  if (err) {
    console.error('❌ PostgreSQL Database Connection Error:', err.message);
  } else {
    const info = res.rows[0];
    console.log(`✅ PostgreSQL Database Connected: [DB: ${info.current_database}, Schema: ${info.current_schema}, PostGIS: ${info.postgis_version}]`);
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  schema: dbSchema
};
