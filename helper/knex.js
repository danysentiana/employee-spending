import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const db = knex({
    client: 'mysql2',
    connection: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'employee_spending',
        port: process.env.DB_PORT || 3306,
    },
    pool: { min: 0, max: 20 },
});

export default db;